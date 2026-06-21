<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Rsvp;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Gate;

class RsvpController extends Controller
{
    public function store(Request $request, $slug)
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'attendance' => 'required|in:hadir,tidak_hadir,ragu_ragu',
            'message' => 'nullable|string|max:1000',
        ]);

        $invitation->rsvps()->create($validated);

        return back()->with('success', 'Terima kasih atas konfirmasi Anda!');
    }

    public function index(Invitation $invitation)
    {
        Gate::authorize('update', $invitation);

        $rsvps = $invitation->rsvps()->latest()->get();

        return Inertia::render('Invitations/Rsvps', [
            'invitation' => $invitation,
            'rsvps' => $rsvps
        ]);
    }
}
