<?php
namespace App\Http\Controllers;
use App\Models\Invitation;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
class InvitationController extends Controller
{
    public function index()
    {
        $invitations = Invitation::where('user_id', auth()->id())
            ->with('category')
            ->latest()
            ->get();
        return Inertia::render('Invitations/Index', [
            'invitations' => $invitations
        ]);
    }
    public function create()
    {
        $themes = [
            // Pernikahan
            [
                'id' => 'luxury-wedding',
                'name' => 'LUXURY WEDDING',
                'preview' => 'https://cdn-uploads.owlink.id/20979960-af61-11f0-ad13-ab15582d2cc0.jpg',
                'category' => 'pernikahan',
                'description' => 'Tema undangan pernikahan LUXURY WEDDING bergaya elegan dan eksklusif.'
            ],
            [
                'id' => 'burgundies-vibes',
                'name' => 'Burgundies Vibes',
                'preview' => 'https://cdn-uploads.owlink.id/20979960-af61-11f0-ad13-ab15582d2cc0.jpg',
                'category' => 'pernikahan',
                'description' => 'Tema premium bernuansa merah burgundi mewah dengan ornamen emas klasik, tipografi serif elegan, dan tekstur eksklusif.'
            ],
            [
                'id' => 'monochrome-3d-cinema',
                'name' => 'Monochrome 3D Cinema',
                'preview' => '/images/themes/monochrome-cinema.png',
                'category' => 'pernikahan',
                'description' => 'Tema premium monokromatik sinematik bersampul elegan, berlatar belakang video prewedding, dan memiliki animasi scroll 3D Camera Movement.'
            ],
            [
                'id' => 'glass-3d-elegant',
                'name' => '3D Glassmorphism Premium',
                'preview' => '/images/themes/3d-glass.png',
                'category' => 'pernikahan',
                'description' => 'Tema premium super clean, sangat elegan, dengan perpaduan efek 3D Tilt interaktif dan material Glassmorphism.'
            ],
            [
                'id' => 'floral-romantic',
                'name' => 'Floral Romantic',
                'preview' => '/images/themes/floral.png',
                'category' => 'pernikahan',
                'description' => 'Desain lembut dengan hiasan bunga mawar yang elegan.'
            ],
            [
                'id' => 'modern-minimalist',
                'name' => 'Modern Minimalist',
                'preview' => '/images/themes/modern.png',
                'category' => 'pernikahan',
                'description' => 'Bersih, profesional, dan fokus pada tipografi yang indah.'
            ],
            [
                'id' => 'gold-luxury',
                'name' => 'Gold Luxury',
                'preview' => '/images/themes/gold.png',
                'category' => 'pernikahan',
                'description' => 'Nuansa emas yang mewah untuk momen spesial Anda.'
            ],
            [
                'id' => 'rpg-touring',
                'name' => 'RPG Touring Classic',
                'preview' => '/images/themes/rpg-touring.png',
                'category' => 'pernikahan',
                'description' => 'Tema interaktif RPG retro 16-bit bertema touring club motor classic. Tamu dapat menggerakkan motor karikatur melewati checkpoint undangan.'
            ],
            // Aqiqah
            [
                'id' => 'aqiqah-cute',
                'name' => 'Aqiqah Cute Baby',
                'preview' => '/images/themes/aqiqah-cute.png',
                'category' => 'aqiqah',
                'description' => 'Desain lucu dan ceria bertema bayi untuk syukuran Aqiqah.'
            ],
            // Khitanan
            [
                'id' => 'khitanan-modern',
                'name' => 'Khitanan Modern Islamic',
                'preview' => '/images/themes/khitanan-modern.png',
                'category' => 'khitanan',
                'description' => 'Desain Islami yang modern dan bersih untuk acara khitanan.'
            ],
            // Ulang Tahun
            [
                'id' => 'birthday-fun',
                'name' => 'Birthday Fun Party',
                'preview' => '/images/themes/birthday-fun.png',
                'category' => 'ulang-tahun',
                'description' => 'Desain penuh warna dan keceriaan untuk pesta ulang tahun.'
            ],
            // Acara Kantor
            [
                'id' => 'office-gathering',
                'name' => 'Corporate Gathering',
                'preview' => '/images/themes/office-gathering.png',
                'category' => 'acara-kantor',
                'description' => 'Desain formal dan profesional untuk acara kumpul kantor.'
            ],
            // Syukuran
            [
                'id' => 'syukuran-modern',
                'name' => 'Syukuran Modern',
                'preview' => '/images/themes/modern.png',
                'category' => 'syukuran',
                'description' => 'Desain elegan untuk acara syukuran.'
            ]
        ];
        return Inertia::render('Invitations/Create', [
            'categories' => EventCategory::all(),
            'themes' => $themes
        ]);
    }
    public function editor(Request $request)
    {
        $audios = \App\Models\Audio::all()->map(function($audio) {
            return [
                'id' => $audio->id,
                'title' => $audio->title,
                'artist' => $audio->artist,
                'category' => $audio->category,
                'url' => '/storage/' . $audio->file_path,
            ];
        });

        return Inertia::render('Invitations/Editor', [
            'theme' => $request->query('theme'),
            'categories' => EventCategory::all(),
            'musicLibrary' => $audios,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_category_id' => 'required|exists:event_categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:invitations,slug',
            'content' => 'required|array',
            'theme_config' => 'nullable|array',
            'cover_image' => 'nullable|image|max:2048',
            'gallery.*' => 'nullable|image|max:2048',
            'music_url' => 'nullable|string',
            'is_active' => 'nullable',
        ]);
        $data = $validated;
        $data['is_active'] = $request->boolean('is_active', false);
        
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('invitations/covers', 'public');
        }
        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('invitations/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        }
        // Handle nested files in content
        $content = $request->input('content', []);
        if ($request->hasFile('content.hero_image')) {
            $content['hero_image'] = $request->file('content.hero_image')->store('invitations/photos', 'public');
        }
        if ($request->hasFile('content.groom_photo')) {
            $content['groom_photo'] = $request->file('content.groom_photo')->store('invitations/photos', 'public');
        }
        if ($request->hasFile('content.bride_photo')) {
            $content['bride_photo'] = $request->file('content.bride_photo')->store('invitations/photos', 'public');
        }
        if ($request->hasFile('content.child_photo')) {
            $content['child_photo'] = $request->file('content.child_photo')->store('invitations/photos', 'public');
        }
        if ($request->hasFile('content.character_image')) {
            $content['character_image'] = $request->file('content.character_image')->store('invitations/photos', 'public');
        }
        if ($request->hasFile('content.love_story_image')) {
            $content['love_story_image'] = $request->file('content.love_story_image')->store('invitations/photos', 'public');
        }
        $data['content'] = $content;
        $invitation = auth()->user()->invitations()->create($data);
        return redirect()->route('invitations.index')->with('success', 'Undangan berhasil dibuat!');
    }
    public function edit(Invitation $invitation)
    {
        Gate::authorize('update', $invitation);

        $audios = \App\Models\Audio::all()->map(function($audio) {
            return [
                'id' => $audio->id,
                'title' => $audio->title,
                'artist' => $audio->artist,
                'category' => $audio->category,
                'url' => '/storage/' . $audio->file_path,
            ];
        });

        return Inertia::render('Invitations/Editor', [
            'invitation' => $invitation,
            'categories' => EventCategory::all(),
            'musicLibrary' => $audios,
        ]);
    }
    public function update(Request $request, Invitation $invitation)
    {
        Gate::authorize('update', $invitation);
        $isActive = $request->boolean('is_active', false);
        
        $rules = [
            'event_category_id' => 'required|exists:event_categories,id',
            'title' => $isActive ? 'required|string|max:255' : 'nullable|string|max:255',
            'slug' => $isActive ? 'required|string|max:255|unique:invitations,slug,' . $invitation->id : 'nullable|string|max:255|unique:invitations,slug,' . $invitation->id,
            'content' => 'required|array',
            'theme_config' => 'nullable|array',
            'cover_image' => 'nullable|image|max:2048',
            'music_url' => 'nullable|string',
            'is_active' => 'nullable',
        ];
        $validated = $request->validate($rules);
        $data = $validated;
        $data['is_active'] = $request->boolean('is_active', false);
        if ($request->hasFile('cover_image')) {
            if ($invitation->cover_image) {
                Storage::disk('public')->delete($invitation->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('invitations/covers', 'public');
        } else {
            // Preserve the existing cover image if no new file is uploaded
            $data['cover_image'] = $invitation->cover_image;
        }
        
        if ($request->boolean('cleared_gallery')) {
            $currentGallery = $invitation->gallery ?? [];
            foreach ($currentGallery as $oldImage) {
                Storage::disk('public')->delete($oldImage);
            }
            $galleryPaths = [];
        } elseif ($request->has('existing_gallery')) {
            $existingGallery = $request->input('existing_gallery', []);
            $currentGallery = $invitation->gallery ?? [];
            
            // Delete gallery images that are no longer in existing_gallery
            foreach ($currentGallery as $oldImage) {
                if (!in_array($oldImage, $existingGallery)) {
                    Storage::disk('public')->delete($oldImage);
                }
            }
            $galleryPaths = $existingGallery;
        } else {
            // Backward compatibility: if existing_gallery is not sent, and new files exist, delete all old.
            if ($request->hasFile('gallery')) {
                if ($invitation->gallery) {
                    foreach ($invitation->gallery as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
            }
            $galleryPaths = $invitation->gallery ?? [];
        }
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('invitations/gallery', 'public');
            }
        }
        
        $data['gallery'] = array_values(array_filter($galleryPaths));
        // Handle nested files in content
        $content = $request->input('content', []);
        $existingContent = $invitation->content ?? [];
        if ($request->hasFile('content.hero_image')) {
            if (!empty($existingContent['hero_image'])) {
                Storage::disk('public')->delete($existingContent['hero_image']);
            }
            $content['hero_image'] = $request->file('content.hero_image')->store('invitations/photos', 'public');
        } else {
            $content['hero_image'] = $existingContent['hero_image'] ?? null;
        }
        if ($request->hasFile('content.groom_photo')) {
            if (!empty($existingContent['groom_photo'])) {
                Storage::disk('public')->delete($existingContent['groom_photo']);
            }
            $content['groom_photo'] = $request->file('content.groom_photo')->store('invitations/photos', 'public');
        } else {
            $content['groom_photo'] = $existingContent['groom_photo'] ?? null;
        }
        if ($request->hasFile('content.bride_photo')) {
            if (!empty($existingContent['bride_photo'])) {
                Storage::disk('public')->delete($existingContent['bride_photo']);
            }
            $content['bride_photo'] = $request->file('content.bride_photo')->store('invitations/photos', 'public');
        } else {
            $content['bride_photo'] = $existingContent['bride_photo'] ?? null;
        }
        if ($request->hasFile('content.child_photo')) {
            if (!empty($existingContent['child_photo'])) {
                Storage::disk('public')->delete($existingContent['child_photo']);
            }
            $content['child_photo'] = $request->file('content.child_photo')->store('invitations/photos', 'public');
        } else {
            $content['child_photo'] = $existingContent['child_photo'] ?? null;
        }
        if ($request->hasFile('content.character_image')) {
            if (!empty($existingContent['character_image'])) {
                Storage::disk('public')->delete($existingContent['character_image']);
            }
            $content['character_image'] = $request->file('content.character_image')->store('invitations/photos', 'public');
        } else {
            $content['character_image'] = $existingContent['character_image'] ?? null;
        }
        if ($request->hasFile('content.love_story_image')) {
            if (!empty($existingContent['love_story_image'])) {
                Storage::disk('public')->delete($existingContent['love_story_image']);
            }
            $content['love_story_image'] = $request->file('content.love_story_image')->store('invitations/photos', 'public');
        } else {
            $content['love_story_image'] = $existingContent['love_story_image'] ?? null;
        }
        $data['content'] = $content;
        $invitation->update($data);
        return redirect()->route('invitations.index')->with('success', 'Undangan berhasil diperbarui!');
    }
    public function destroy(Invitation $invitation)
    {
        Gate::authorize('update', $invitation);
        if ($invitation->cover_image) {
            Storage::disk('public')->delete($invitation->cover_image);
        }
        if ($invitation->gallery) {
            foreach ($invitation->gallery as $image) {
                Storage::disk('public')->delete($image);
            }
        }
        $content = $invitation->content ?? [];
        if (!empty($content['hero_image'])) Storage::disk('public')->delete($content['hero_image']);
        if (!empty($content['groom_photo'])) Storage::disk('public')->delete($content['groom_photo']);
        if (!empty($content['bride_photo'])) Storage::disk('public')->delete($content['bride_photo']);
        if (!empty($content['child_photo'])) Storage::disk('public')->delete($content['child_photo']);
        if (!empty($content['character_image'])) Storage::disk('public')->delete($content['character_image']);
        if (isset($content['love_stories']) && is_array($content['love_stories'])) {
            foreach ($content['love_stories'] as $story) {
                if (!empty($story['image'])) Storage::disk('public')->delete($story['image']);
            }
        }
        $invitation->delete();
        return redirect()->route('invitations.index')->with('success', 'Undangan berhasil dihapus.');
    }
    public function show(Request $request, $slug)
    {
        $invitation = Invitation::where('slug', $slug)
            ->with(['category', 'rsvps' => function($query) {
                $query->latest()->limit(20);
            }])
            ->firstOrFail();
        
        $guest = null;
        if ($request->has('code')) {
            $guest = \App\Models\Guest::where('invitation_id', $invitation->id)
                ->where('code', $request->query('code'))
                ->first();
        }
        
        return Inertia::render('Invitations/Show', [
            'invitation' => $invitation,
            'guest' => $guest
        ]);
    }
    public function previewTheme($theme)
    {
        $dummyInvitation = [
            'title' => 'Preview Template',
            'slug' => 'preview-template',
            'is_active' => false,
            'theme_config' => [
                'theme_id' => $theme,
                'mode' => 'light',
                'accent_color' => '#cba93c'
            ],
            'category' => [
                'name' => 'Pernikahan',
                'slug' => 'pernikahan'
            ],
            'content' => [
                'groom_name' => 'Romeo Montague',
                'groom_nickname' => 'Romeo',
                'bride_name' => 'Juliet Capulet',
                'bride_nickname' => 'Juliet',
                'groom_parents' => 'Putra dari Bpk. Montague',
                'bride_parents' => 'Putri dari Bpk. Capulet',
                'event_date' => now()->addDays(30)->toDateTimeString(),
                'event_location' => 'Grand Ballroom',
                'salam_pembuka' => 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
                'teks_pembuka' => 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.',
                'love_stories' => [
                    ['date' => 'Januari 2024', 'story' => 'Awal mula pertemuan kami yang tak terduga.']
                ]
            ],
            'rsvps' => [],
            'cover_image' => null,
            'gallery' => [],
            'music_url' => null,
        ];
        return Inertia::render('Invitations/Show', [
            'invitation' => $dummyInvitation,
            'guest' => null
        ]);
    }
}
