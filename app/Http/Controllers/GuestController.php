<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Guest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function index(Invitation $invitation)
    {
        Gate::authorize('update', $invitation);

        $guests = $invitation->guests()->latest()->get();

        return Inertia::render('Invitations/Guests', [
            'invitation' => $invitation,
            'guests' => $guests
        ]);
    }

    public function store(Request $request, Invitation $invitation)
    {
        Gate::authorize('update', $invitation);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        // Generate unique code
        do {
            $code = Str::random(8);
        } while (Guest::where('code', $code)->exists());

        $invitation->guests()->create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'code' => $code,
            'is_sent' => false
        ]);

        return back()->with('success', 'Tamu berhasil ditambahkan!');
    }

    public function destroy(Invitation $invitation, Guest $guest)
    {
        Gate::authorize('update', $invitation);

        if ($guest->invitation_id !== $invitation->id) {
            abort(403);
        }

        $guest->delete();

        return back()->with('success', 'Tamu berhasil dihapus!');
    }

    public function downloadTemplate(Invitation $invitation)
    {
        Gate::authorize('update', $invitation);

        return response()->streamDownload(function () {
            echo "Nama Tamu,Nomor HP\n";
            echo "Ahmad Budi,081234567890\n";
            echo "Siti Aminah,089876543210\n";
        }, 'template_import_tamu.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function import(Request $request, Invitation $invitation)
    {
        Gate::authorize('update', $invitation);

        $request->validate([
            'file' => 'required|file|max:2048',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        // Skip header row
        fgetcsv($handle);

        while (($row = fgetcsv($handle, 1000, ',')) !== false) {
            // Support semicolon delimited CSVs commonly exported by Excel in certain regions
            if (count($row) === 1 && str_contains($row[0], ';')) {
                $row = explode(';', $row[0]);
            }

            if (empty($row[0])) continue;

            $name = trim($row[0]);
            $phone = isset($row[1]) ? trim($row[1]) : null;
            
            // Format phone number to clean it (e.g. remove spaces, dashes)
            if ($phone) {
                $phone = preg_replace('/[^0-9]/', '', $phone);
                // Convert leading 0 to 62 if needed
                if (str_starts_with($phone, '0')) {
                    $phone = '62' . substr($phone, 1);
                }
            }

            do {
                $code = Str::random(8);
            } while (Guest::where('code', $code)->exists());

            $invitation->guests()->create([
                'name' => $name,
                'phone' => $phone,
                'code' => $code,
                'is_sent' => false
            ]);
        }
        fclose($handle);

        return back()->with('success', 'Daftar tamu berhasil diimpor!');
    }

    public function markAsSent(Guest $guest)
    {
        $invitation = $guest->invitation;
        Gate::authorize('update', $invitation);

        $guest->update(['is_sent' => true]);

        return response()->json(['success' => true]);
    }
}
