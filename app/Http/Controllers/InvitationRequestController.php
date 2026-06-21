<?php

namespace App\Http\Controllers;

use App\Models\EventCategory;
use App\Models\InvitationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvitationRequestController extends Controller
{
    /**
     * Display the form for creating a new request.
     */
    public function create()
    {
        // Check if user has Gold package (Emas)
        if (!auth()->user()->hasPackage('Emas')) {
            return redirect()->route('dashboard')->with('error', 'Hanya pengguna Paket Emas yang dapat menggunakan layanan ini.');
        }

        return Inertia::render('InvitationRequests/Create', [
            'categories' => EventCategory::all()
        ]);
    }

    /**
     * Store a newly created request in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_category_id' => 'required|exists:event_categories,id',
            'data' => 'required|array',
        ]);

        InvitationRequest::create([
            'user_id' => auth()->id(),
            'event_category_id' => $request->event_category_id,
            'data' => $request->data,
            'status' => 'pending',
        ]);

        return redirect()->route('dashboard')->with('success', 'Permintaan Anda telah dikirim ke Admin!');
    }

    /**
     * Display user's requests.
     */
    public function index()
    {
        $requests = auth()->user()->invitationRequests()->with('category')->latest()->get();

        return Inertia::render('InvitationRequests/Index', [
            'requests' => $requests
        ]);
    }
}
