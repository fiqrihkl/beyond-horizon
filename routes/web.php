<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\RsvpController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\GuestController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Invitation Public View & RSVP Submission
Route::get('/v/{slug}', [InvitationController::class, 'show'])->name('invitations.show');
Route::post('/v/{slug}/rsvp', [RsvpController::class, 'store'])->name('rsvps.store');
Route::get('/theme-preview/{theme}', [InvitationController::class, 'previewTheme'])->name('theme.preview');

// Midtrans Webhook (Exempt from CSRF)
Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->name('payments.webhook');

// User Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        
        $totalInvitations = $user->invitations()->count();
        $totalRsvps = \App\Models\Rsvp::whereIn('invitation_id', $user->invitations()->pluck('id'))->count();
        $recentInvitations = $user->invitations()->with('category')->latest()->limit(5)->get();

        return Inertia::render('Dashboard', [
            'packages' => \App\Models\Package::where('price', '>', 0)->get(),
            'activeSubscription' => $user->activeSubscription()->with('package')->first(),
            'myRequests' => $user->invitationRequests()->with('eventCategory')->latest()->get(),
            'stats' => [
                'total_invitations' => $totalInvitations,
                'total_rsvps' => $totalRsvps,
            ],
            'recentInvitations' => $recentInvitations,
        ]);
    })->name('dashboard');

    Route::get('/invitations/editor', [InvitationController::class, 'editor'])->name('invitations.editor');
    Route::resource('invitations', InvitationController::class)->except(['show']);
    Route::get('/invitations/{invitation}/rsvps', [RsvpController::class, 'index'])->name('invitations.rsvps');
    
    // Guest Management Routes
    Route::get('/invitations/{invitation}/guests', [GuestController::class, 'index'])->name('invitations.guests.index');
    Route::post('/invitations/{invitation}/guests', [GuestController::class, 'store'])->name('invitations.guests.store');
    Route::delete('/invitations/{invitation}/guests/{guest}', [GuestController::class, 'destroy'])->name('invitations.guests.destroy');
    Route::get('/invitations/{invitation}/guests/template', [GuestController::class, 'downloadTemplate'])->name('invitations.guests.template');
    Route::post('/invitations/{invitation}/guests/import', [GuestController::class, 'import'])->name('invitations.guests.import');
    Route::post('/guests/{guest}/sent', [GuestController::class, 'markAsSent'])->name('guests.sent');

    // Payment Routes
    Route::post('/payments/checkout', [PaymentController::class, 'checkout'])->name('payments.checkout');

    // Invitation Request Routes (Done-for-You)
    Route::get('/requests', [\App\Http\Controllers\InvitationRequestController::class, 'index'])->name('requests.index');
    Route::get('/requests/create', [\App\Http\Controllers\InvitationRequestController::class, 'create'])->name('requests.create');
    Route::post('/requests', [\App\Http\Controllers\InvitationRequestController::class, 'store'])->name('requests.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->as('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/requests', [AdminController::class, 'invitationRequests'])->name('requests.index');
    Route::patch('/requests/{id}', [AdminController::class, 'updateRequestStatus'])->name('requests.update');
    Route::resource('audios', \App\Http\Controllers\Admin\AudioController::class)->only(['index', 'store', 'destroy']);
});

require __DIR__.'/auth.php';
