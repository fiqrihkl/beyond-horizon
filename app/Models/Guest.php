<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $fillable = [
        'invitation_id',
        'name',
        'phone',
        'code',
        'is_sent',
    ];

    protected $casts = [
        'is_sent' => 'boolean',
    ];

    public function invitation()
    {
        return $this->belongsTo(Invitation::class);
    }
}
