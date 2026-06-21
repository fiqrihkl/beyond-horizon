<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Audio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AudioController extends Controller
{
    public function index()
    {
        $audios = Audio::latest()->get();
        return Inertia::render('Admin/Audios/Index', [
            'audios' => $audios
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'file' => 'required|mimes:mp3|max:10240', // max 10MB mp3
        ]);

        $filePath = $request->file('file')->store('audios', 'public');

        Audio::create([
            'title' => $request->title,
            'artist' => $request->artist,
            'category' => $request->category,
            'file_path' => $filePath,
        ]);

        return back()->with('success', 'Audio berhasil diunggah.');
    }

    public function destroy($id)
    {
        $audio = Audio::findOrFail($id);

        if (Storage::disk('public')->exists($audio->file_path)) {
            Storage::disk('public')->delete($audio->file_path);
        }

        $audio->delete();

        return back()->with('success', 'Audio berhasil dihapus.');
    }
}
