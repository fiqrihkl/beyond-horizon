<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Transaction;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = config('services.midtrans.is_sanitized');
        Config::$is3ds = config('services.midtrans.is_3ds');
    }

    public function checkout(Request $request)
    {
        $package = Package::findOrFail($request->package_id);
        $user = auth()->user();

        $orderId = 'TRX-' . Str::upper(Str::random(10));

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $package->price,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'reference_id' => $orderId,
            'amount' => $package->price,
            'snap_token' => $snapToken,
            'status' => 'pending',
        ]);

        return response()->json([
            'snap_token' => $snapToken,
            'order_id' => $orderId
        ]);
    }

    public function webhook(Request $request)
    {
        $notif = new \Midtrans\Notification();

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraud = $notif->fraud_status;

        $trx = Transaction::where('reference_id', $orderId)->first();

        if (!$trx) return response()->json(['message' => 'Transaction not found'], 404);

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $trx->status = 'challenge';
                } else {
                    $trx->status = 'success';
                }
            }
        } else if ($transaction == 'settlement') {
            $trx->status = 'success';
        } else if ($transaction == 'pending') {
            $trx->status = 'pending';
        } else if ($transaction == 'deny') {
            $trx->status = 'deny';
        } else if ($transaction == 'expire') {
            $trx->status = 'expire';
        } else if ($transaction == 'cancel') {
            $trx->status = 'cancel';
        }

        $trx->payment_type = $type;
        $trx->save();

        if ($trx->status == 'success') {
            // Update or Create Subscription
            Subscription::updateOrCreate(
                ['user_id' => $trx->user_id],
                [
                    'package_id' => $trx->package_id,
                    'starts_at' => now(),
                    'expires_at' => now()->addYear(), // Default 1 year
                    'status' => 'active'
                ]
            );
        }

        return response()->json(['message' => 'Webhook received']);
    }
}
