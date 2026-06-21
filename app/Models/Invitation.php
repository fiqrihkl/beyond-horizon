<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    protected $fillable = [
        'user_id',
        'event_category_id',
        'title',
        'slug',
        'content',
        'theme_config',
        'is_active',
        'cover_image',
        'gallery',
        'music_url',
    ];

    protected $casts = [
        'content' => 'array',
        'theme_config' => 'array',
        'is_active' => 'boolean',
        'gallery' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(EventCategory::class, 'event_category_id');
    }

    public function rsvps()
    {
        return $this->hasMany(Rsvp::class);
    }

    public function guests()
    {
        return $this->hasMany(Guest::class);
    }
}
