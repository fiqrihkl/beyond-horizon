<?php

namespace App\Policies;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InvitationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Invitation $invitation): bool
    {
        return $user->id == $invitation->user_id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Invitation $invitation): bool
    {
        return $user->id == $invitation->user_id || $user->role === 'admin';
    }

    public function delete(User $user, Invitation $invitation): bool
    {
        return $user->id == $invitation->user_id || $user->role === 'admin';
    }
}
