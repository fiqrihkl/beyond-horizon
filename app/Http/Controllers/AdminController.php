<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Invitation;
use App\Models\Subscription;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_invitations' => Invitation::count(),
                'total_revenue' => \App\Models\Transaction::whereIn('status', ['success', 'settled', 'capture'])->sum('amount'),
                'active_subscriptions' => Subscription::where('status', 'active')->count(),
                'pending_requests' => \App\Models\InvitationRequest::where('status', 'pending')->count(),
            ]
        ]);
    }

    public function invitationRequests()
    {
        $requests = \App\Models\InvitationRequest::with(['user', 'category'])->latest()->get();

        return Inertia::render('Admin/InvitationRequests/Index', [
            'requests' => $requests
        ]);
    }

    public function updateRequestStatus(\Illuminate\Http\Request $request, $id)
    {
        $invitationRequest = \App\Models\InvitationRequest::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:pending,processing,completed,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $invitationRequest->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
        ]);

        return back()->with('success', 'Status permintaan berhasil diperbarui.');
    }
}
