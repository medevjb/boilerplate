<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }} — Maintenance</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            background: #0a0a0a;
            color: #fafafa;
            text-align: center;
            padding: 1.5rem;
        }
        .card {
            max-width: 28rem;
        }
        h1 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 0.5rem;
        }
        p {
            color: #a1a1aa;
            line-height: 1.6;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>We'll be right back</h1>
        <p>{{ $exception->getMessage() ?: 'This application is currently undergoing scheduled maintenance.' }}</p>
    </div>
</body>
</html>
