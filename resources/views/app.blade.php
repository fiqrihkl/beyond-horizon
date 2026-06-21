<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- OpenGraph Meta Tags for Link Preview -->
        @if(isset($page['props']['invitation']))
            @php
                $inv = $page['props']['invitation'];
                $ogTitle = $inv['title'];
                $ogDesc = isset($inv['content']['teks_pembuka']) ? $inv['content']['teks_pembuka'] : 'Mengundang Anda untuk hadir di acara kami.';
                $ogImage = !empty($inv['cover_image']) ? asset('storage/' . $inv['cover_image']) : asset('logo.png'); // Pastikan logo.png ada di public, atau biarkan default
                $ogUrl = request()->url();
            @endphp
            <meta property="og:title" content="{{ $ogTitle }}" />
            <meta property="og:description" content="{{ $ogDesc }}" />
            @if($ogImage)
                <meta property="og:image" content="{{ $ogImage }}" />
            @endif
            <meta property="og:url" content="{{ $ogUrl }}" />
            <meta property="og:type" content="website" />
            
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="{{ $ogTitle }}" />
            <meta name="twitter:description" content="{{ $ogDesc }}" />
            @if($ogImage)
                <meta name="twitter:image" content="{{ $ogImage }}" />
            @endif
        @endif

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=figtree:400,500,600&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Cinzel:wght@400..900&family=Great+Vibes&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
