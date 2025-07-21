<?php
$animesDir = __DIR__ . 'public/animes/';
$animes = [];

if (is_dir($animesDir)) {
    $dirs = scandir($animesDir);
    foreach ($dirs as $dir) {
        if ($dir === '.' || $dir === '..') continue;
        if (is_dir($animesDir . '/' . $dir)) {
            $animes[] = $dir;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Index de Animes</title>
</head>
<body>
    <h1>Animes disponíveis</h1>
    <?php if (empty($animes)): ?>
        <p>Nenhum anime disponível.</p>
    <?php else: ?>
        <ul>
            <?php foreach ($animes as $anime): ?>
                <li><a href="animes/<?= urlencode($anime) ?>/"><?= htmlspecialchars($anime) ?></a></li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</body>
</html>
