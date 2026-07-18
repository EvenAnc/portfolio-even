========== SCRIPT ==========
$html = Get-Content index.html -Raw
$temp = Get-Content temp_html.txt -Raw
$start = $html.IndexOf('<div class="projects-grid">')
$end = $html.IndexOf('<!-- Flèche suivant → -->', $start)
$newHtml = $html.Substring(0, $start) + $temp + "`n                " + $html.Substring($end)
Set-Content index.html -Value $newHtml -Encoding UTF8
========== SCRIPT ==========
$html = Get-Content index.html -Raw -Encoding UTF8; $temp = Get-Content temp_html.txt -Raw -Encoding UTF8; $start = $html.IndexOf('<div class="projects-grid">'); $end = $html.IndexOf('<!-- Flèche suivant', $start); $newHtml = $html.Substring(0, $start) + $temp + "`n                " + $html.Substring($end); Set-Content index.html -Value $newHtml -Encoding UTF8
========== SCRIPT ==========
$content = Get-Content 'index.html' -Raw
$loader = '<div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div>'
$content = [regex]::Replace($content, '(<canvas class="pdf-inline-render" data-pdf-url="[^"]+"></canvas>)', "`$1$loader")
Set-Content 'index.html' -Value $content
========== SCRIPT ==========
$content = Get-Content 'index.html' -Raw

# Find the start and end indices of each section
$plansStart = $content.IndexOf("<!-- CAROUSEL PLANS -->")
$coupesStart = $content.IndexOf("<!-- CAROUSEL COUPES -->")
$analysesStart = $content.IndexOf("<!-- CAROUSEL ANALYSES -->")
$analysesEnd = $content.IndexOf("<!-- Flèche suivant")

$plansContent = $content.Substring($plansStart, $coupesStart - $plansStart)
$coupesContent = $content.Substring($coupesStart, $analysesStart - $coupesStart)
$analysesContent = $content.Substring($analysesStart, $analysesEnd - $analysesStart)

$before = $content.Substring(0, $plansStart)
$after = $content.Substring($analysesEnd)

$newContent = $before + $analysesContent + $plansContent + $coupesContent + $after
Set-Content 'index.html' -Value $newContent

========== SCRIPT ==========
$content = Get-Content 'index.html' -Raw

$plansStart = $content.IndexOf("<!-- CAROUSEL PLANS -->")
$coupesStart = $content.IndexOf("<!-- CAROUSEL COUPES -->")
$analysesStart = $content.IndexOf("<!-- CAROUSEL ANALYSES -->")
$analysesEnd = $content.IndexOf("<!-- Flèche suivant")

if ($plansStart -gt 0 -and $coupesStart -gt $plansStart -and $analysesStart -gt $coupesStart -and $analysesEnd -gt $analysesStart) {
    $plansContent = $content.Substring($plansStart, $coupesStart - $plansStart)
    $coupesContent = $content.Substring($coupesStart, $analysesStart - $coupesStart)
    $analysesContent = $content.Substring($analysesStart, $analysesEnd - $analysesStart)

    $before = $content.Substring(0, $plansStart)
    $after = $content.Substring($analysesEnd)

    $newContent = $before + $analysesContent + $plansContent + $coupesContent + $after

    $loader = '<div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div>'
    $newContent = [regex]::Replace($newContent, '(<canvas class="pdf-inline-render" data-pdf-url="[^"]+"></canvas>)', "`$1$loader")

    Set-Content 'index.html' -Value $newContent
    Write-Output "Success"
} else {
    Write-Output "Failed to find indices: $plansStart, $coupesStart, $analysesStart, $analysesEnd"
}
========== SCRIPT ==========
$zoning = @"
                <!-- CAROUSEL ANALYSES -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">ZONING & ANALYSES</h4>
                        <p class="bd-section-subtitle">Plan masse, Trame et Circulations</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan masse.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/trame.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/zooning batiment.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/zooning circulation.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 4</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$plans = @"
                <!-- CAROUSEL PLANS -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">PLANS D'ARCHITECTURE</h4>
                        <p class="bd-section-subtitle">R-1 à R+1 & Zooms</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r-1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan rdc.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r+1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan station.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="4"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan resto.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="5"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan garage.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="6"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan expo.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 7</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$coupes = @"
                <!-- CAROUSEL COUPES -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">COUPES ARCHITECTURALES</h4>
                        <p class="bd-section-subtitle">Coupes lointaines et texturées</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord loingtaine.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe ouest texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe sud texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 4</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$header = @"
                <div class="projects-header" style="margin-bottom: 24px; text-align: center;">
                    <h3 class="font-sketch" style="color: var(--red); font-size: 2rem;">PROJET 01 : DIPLÔME</h3>
                </div>
"@

$content = Get-Content 'index.html' -Raw
$newContent = [regex]::Replace($content, '(?s)<div class="projects-grid">.*?</div>\s*</div>\s*<!-- Flèche suivant → -->', "$header$zoning$plans$coupes`n                <!-- Flèche suivant → -->")
Set-Content 'index.html' -Value $newContent

========== SCRIPT ==========
$zoning = @"
                <!-- CAROUSEL ANALYSES -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">ZONING & ANALYSES</h4>
                        <p class="bd-section-subtitle">Plan masse, Trame et Circulations</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan masse.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/trame.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/zooning batiment.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/zooning circulation.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 4</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$plans = @"
                <!-- CAROUSEL PLANS -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">PLANS D'ARCHITECTURE</h4>
                        <p class="bd-section-subtitle">R-1 à R+1 & Zooms</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r-1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan rdc.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r+1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan station.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="4"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan resto.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="5"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan garage.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="6"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan expo.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 7</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$coupes = @"
                <!-- CAROUSEL COUPES -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">COUPES ARCHITECTURALES</h4>
                        <p class="bd-section-subtitle">Coupes lointaines et texturées</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord loingtaine.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe ouest texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe sud texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 4</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$header = @"
                <div class="projects-header" style="margin-bottom: 24px; text-align: center;">
                    <h3 class="font-sketch" style="color: var(--red); font-size: 2rem;">PROJET 01 : DIPLÔME</h3>
                </div>
"@

$content = Get-Content 'index.html' -Raw
$startStr = '<div class="projects-grid">'
$endStr = '<a href="javascript:void(0)" class="page-next"'

$startIndex = $content.IndexOf($startStr)
$endIndex = $content.IndexOf($endStr)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    
    $newContent = $before + "`n" + $header + "`n" + $zoning + "`n" + $plans + "`n" + $coupes + "`n`n                <!-- Flèche suivant -->`n                " + $after
    Set-Content 'index.html' -Value $newContent
    Write-Output "Successfully updated index.html"
} else {
    Write-Output "Indices not found: $startIndex, $endIndex"
}
========== SCRIPT ==========
$zoning = @"
                <!-- CAROUSEL ANALYSES -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">ZONING & ANALYSES</h4>
                        <p class="bd-section-subtitle">Plan masse, Trame et Circulations</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan masse.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/trame.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/zooning batiment.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/zooning circulation.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 4</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$plans = @"
                <!-- CAROUSEL PLANS -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">PLANS D'ARCHITECTURE</h4>
                        <p class="bd-section-subtitle">R-1 à R+1 & Zooms</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r-1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan rdc.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r+1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan station.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="4"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan resto.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="5"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan garage.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="6"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan expo.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 7</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$coupes = @"
                <!-- CAROUSEL COUPES -->
                <div class="bd-carousel-section carousel-landscape">
                    <div class="bd-carousel-header">
                        <h4 class="font-sketch">COUPES ARCHITECTURALES</h4>
                        <p class="bd-section-subtitle">Coupes lointaines et texturées</p>
                    </div>
                    <div class="bd-carousel-container">
                        <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                            </svg>
                        </button>
                        
                        <div class="frame-wrap">
                            <div class="bd-carousel-viewport">
                                <div class="bd-carousel-track">
                                    <div class="bd-slide active" data-slide="0"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord loingtaine.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="1"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="2"><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe ouest texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                    <div class="bd-slide" data-slide="3"><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/coupe sud texturé.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg></div></div></div></div>
                                </div>
                            </div>
                            <svg class="sketch-rect-svg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                                <path class="sketch-rect-path" d="M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                            <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                            </svg>
                        </button>
                    </div>
                    <div class="bd-carousel-controls">
                        <div class="bd-page-indicator font-sketch">1 / 4</div>
                        <div class="bd-progress-container"><div class="bd-progress-bar"></div></div>
                    </div>
                </div>
"@

$header = @"
                <div class="projects-header" style="margin-bottom: 24px; text-align: center;">
                    <h3 class="font-sketch" style="color: var(--red); font-size: 2rem;">PROJET 01 : DIPLÔME</h3>
                </div>
"@

$content = Get-Content 'index.html' -Raw -Encoding UTF8
$startStr = '<div class="projects-grid">'
$endStr = '<a href="javascript:void(0)" class="page-next"'

$startIndex = $content.IndexOf($startStr)
$endIndex = $content.IndexOf($endStr)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    
    $newContent = $before + "`n" + $header + "`n" + $zoning + "`n" + $plans + "`n" + $coupes + "`n`n                <!-- Flèche suivant -->`n                " + $after
    
    # ADD PDF DATA SCRIPT TAG!
    $newContent = [regex]::Replace($newContent, '(?s)<script src="https://cdnjs\.cloudflare\.com/ajax/libs/pdf\.js/3\.11\.174/pdf\.min\.js"></script>\s*<script src="js/app\.js"></script>', "<script src=`"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`"></script>`n    <script src=`"js/pdf_data.js`"></script>`n    <script src=`"js/app.js`"></script>")
    
    Set-Content 'index.html' -Value $newContent -Encoding UTF8
    Write-Output "Successfully updated index.html"
} else {
    Write-Output "Indices not found: $startIndex, $endIndex"
}
========== SCRIPT ==========
$content = Get-Content 'index.html' -Raw -Encoding UTF8
$oldSvg = '<svg viewBox="0 0 100 100"><path d="M 50,10 A 40,40 0 1,1 10,50" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="20 15 40 10" /><path d="M 48,12 A 38,38 0 1,1 12,48" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 20 30 10" opacity="0.6"/></svg>'
$newSvg = '<svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg>'

$content = $content.Replace($oldSvg, $newSvg)
Set-Content 'index.html' -Value $content -Encoding UTF8
Write-Output "SVG replaced in index.html"

========== SCRIPT ==========
$newHtml = @"
<p class="page-intro" data-i18n="projects_intro">Conception d'espaces minimalistes et modélisations techniques 3D.</p>
                
                <div class="projects-grid fortiche-projects-board">
                    
                    <!-- HEADER -->
                    <div class="projects-board-header">
                        <h3 class="font-sketch tape-title">PROJET 01 : DIPLÔME</h3>
                        <p class="board-subtitle">Conception d'espaces minimalistes et modélisations techniques 3D.</p>
                    </div>

                    <!-- 1. ZONING & ANALYSES : Scrapbook Layout -->
                    <div class="fortiche-section scrapbook-section">
                        <div class="section-tag font-sketch">ZONING & ANALYSES</div>
                        
                        <div class="scrapbook-grid">
                            <!-- Plan masse -->
                            <div class="scrapbook-item item-large bd-slide active" data-slide="0">
                                <div class="scrapbook-note font-sketch">Plan masse</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/plan masse.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Trame -->
                            <div class="scrapbook-item item-tilted-right bd-slide active" data-slide="1">
                                <div class="scrapbook-note font-sketch">Trame</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/trame.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Zoning Bâtiment -->
                            <div class="scrapbook-item item-tilted-left bd-slide active" data-slide="2">
                                <div class="scrapbook-note font-sketch">Zoning Bâtiment</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/zooning batiment.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Zoning Circulation -->
                            <div class="scrapbook-item item-tilted-right-more bd-slide active" data-slide="3">
                                <div class="scrapbook-note font-sketch">Zoning Circulation</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/zooning circulation.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. PLANS D'ARCHITECTURE : Blueprint Filmstrip -->
                    <div class="fortiche-section blueprint-section bd-carousel-section carousel-landscape custom-filmstrip">
                        <div class="section-tag font-sketch">PLANS D'ARCHITECTURE</div>
                        <div class="bd-carousel-container">
                            <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                                <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                    <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                    <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                                </svg>
                            </button>
                            
                            <div class="frame-wrap">
                                <div class="bd-carousel-viewport">
                                    <div class="bd-carousel-track">
                                        <div class="bd-slide active" data-slide="0"><div class="filmstrip-note font-sketch">Plan R-1</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r-1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="1"><div class="filmstrip-note font-sketch">Plan RDC</div><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan rdc.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="2"><div class="filmstrip-note font-sketch">Plan R+1</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r+1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="3"><div class="filmstrip-note font-sketch">Zoom Station</div><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan station.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="4"><div class="filmstrip-note font-sketch">Zoom Resto</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan resto.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="5"><div class="filmstrip-note font-sketch">Zoom Garage</div><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan garage.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="6"><div class="filmstrip-note font-sketch">Zoom Expo</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan expo.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                    </div>
                                </div>
                            </div>

                            <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                                <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                    <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                    <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- 3. COUPES ARCHITECTURALES : Vertical Stack -->
                    <div class="fortiche-section cut-stack-section">
                        <div class="section-tag font-sketch">COUPES ARCHITECTURALES</div>
                        
                        <div class="cut-stack">
                            <div class="stack-item bd-slide active" data-slide="0">
                                <div class="stack-note font-sketch">Coupe Lointaine</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord loingtaine.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="stack-item bd-slide active" data-slide="1">
                                <div class="stack-note font-sketch">Coupe Nord</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord texturé.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="stack-item bd-slide active" data-slide="2">
                                <div class="stack-note font-sketch">Coupe Ouest</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe ouest texturé.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="stack-item bd-slide active" data-slide="3">
                                <div class="stack-note font-sketch">Coupe Sud</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe sud texturé.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. PATCHWORK 3D (Placeholder) -->
                    <div class="fortiche-section patchwork-section">
                        <div class="section-tag font-sketch">RENDUS 3D</div>
                        <p class="font-sketch placeholder-text" style="color: var(--notebook-text); opacity: 0.5; margin-top: 20px;">[ Espace réservé pour le patchwork 3D : Intérieur, Immersion, Vues lointaines ]</p>
                        <div class="patchwork-grid-placeholder">
                             <!-- To be filled later -->
                        </div>
                    </div>

                </div>
`n"

$content = Get-Content 'index.html' -Raw -Encoding UTF8
$startStr = '<p class="page-intro"'
$endStr = '<a href="javascript:void(0)" class="page-next"'

$startIndex = $content.IndexOf($startStr)
$endIndex = $content.IndexOf($endStr)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    
    $finalHtml = $before + $newHtml + "                " + $after
    Set-Content 'index.html' -Value $finalHtml -Encoding UTF8
    Write-Output "Successfully updated index.html"
} else {
    Write-Output "Indices not found: $startIndex, $endIndex"
}
========== SCRIPT ==========
$newHtml = @"
<p class="page-intro" data-i18n="projects_intro">Conception d'espaces minimalistes et modélisations techniques 3D.</p>
                
                <div class="projects-grid fortiche-projects-board">
                    
                    <!-- HEADER -->
                    <div class="projects-board-header">
                        <h3 class="font-sketch tape-title">PROJET 01 : DIPLÔME</h3>
                        <p class="board-subtitle">Conception d'espaces minimalistes et modélisations techniques 3D.</p>
                    </div>

                    <!-- 1. ZONING & ANALYSES : Scrapbook Layout -->
                    <div class="fortiche-section scrapbook-section">
                        <div class="section-tag font-sketch">ZONING & ANALYSES</div>
                        
                        <div class="scrapbook-grid">
                            <!-- Plan masse -->
                            <div class="scrapbook-item item-large bd-slide active" data-slide="0">
                                <div class="scrapbook-note font-sketch">Plan masse</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/plan masse.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Trame -->
                            <div class="scrapbook-item item-tilted-right bd-slide active" data-slide="1">
                                <div class="scrapbook-note font-sketch">Trame</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/trame.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Zoning Bâtiment -->
                            <div class="scrapbook-item item-tilted-left bd-slide active" data-slide="2">
                                <div class="scrapbook-note font-sketch">Zoning Bâtiment</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/zooning batiment.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Zoning Circulation -->
                            <div class="scrapbook-item item-tilted-right-more bd-slide active" data-slide="3">
                                <div class="scrapbook-note font-sketch">Zoning Circulation</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/zooning circulation.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. PLANS D'ARCHITECTURE : Blueprint Filmstrip -->
                    <div class="fortiche-section blueprint-section bd-carousel-section carousel-landscape custom-filmstrip">
                        <div class="section-tag font-sketch">PLANS D'ARCHITECTURE</div>
                        <div class="bd-carousel-container">
                            <button class="bd-nav-btn prev-btn" aria-label="Page précédente">
                                <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M 26 9 L 14 21 L 27 29" class="sketch-f1" />
                                    <path d="M 24 11 L 16 19 L 23 31" class="sketch-f2" />
                                    <path d="M 25 10 Q 15 20 15 20 Q 20 25 25 30" class="sketch-f3" />
                                </svg>
                            </button>
                            
                            <div class="frame-wrap">
                                <div class="bd-carousel-viewport">
                                    <div class="bd-carousel-track">
                                        <div class="bd-slide active" data-slide="0"><div class="filmstrip-note font-sketch">Plan R-1</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r-1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="1"><div class="filmstrip-note font-sketch">Plan RDC</div><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan rdc.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="2"><div class="filmstrip-note font-sketch">Plan R+1</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan r+1.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="3"><div class="filmstrip-note font-sketch">Zoom Station</div><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan station.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="4"><div class="filmstrip-note font-sketch">Zoom Resto</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan resto.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="5"><div class="filmstrip-note font-sketch">Zoom Garage</div><div class="drawing-sheet-wrap torn-frame torn-alt"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan garage.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                        <div class="bd-slide" data-slide="6"><div class="filmstrip-note font-sketch">Zoom Expo</div><div class="drawing-sheet-wrap torn-frame"><div class="media-frame-inner drawing-sheet"><canvas class="pdf-inline-render" data-pdf-url="PDF/plan expo.pdf"></canvas><div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div></div></div></div>
                                    </div>
                                </div>
                            </div>

                            <button class="bd-nav-btn next-btn" aria-label="Page suivante">
                                <svg viewBox="0 0 40 40" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M 14 9 L 26 21 L 13 29" class="sketch-f1" />
                                    <path d="M 16 11 L 24 19 L 17 31" class="sketch-f2" />
                                    <path d="M 15 10 Q 25 20 25 20 Q 20 25 15 30" class="sketch-f3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- 3. COUPES ARCHITECTURALES : Vertical Stack -->
                    <div class="fortiche-section cut-stack-section">
                        <div class="section-tag font-sketch">COUPES ARCHITECTURALES</div>
                        
                        <div class="cut-stack">
                            <div class="stack-item bd-slide active" data-slide="0">
                                <div class="stack-note font-sketch">Coupe Lointaine</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord loingtaine.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="stack-item bd-slide active" data-slide="1">
                                <div class="stack-note font-sketch">Coupe Nord</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe nord texturé.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="stack-item bd-slide active" data-slide="2">
                                <div class="stack-note font-sketch">Coupe Ouest</div>
                                <div class="drawing-sheet-wrap torn-frame">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe ouest texturé.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="stack-item bd-slide active" data-slide="3">
                                <div class="stack-note font-sketch">Coupe Sud</div>
                                <div class="drawing-sheet-wrap torn-frame torn-alt">
                                    <div class="media-frame-inner drawing-sheet">
                                        <canvas class="pdf-inline-render" data-pdf-url="PDF/coupe sud texturé.pdf"></canvas>
                                        <div class="inline-pdf-loader"><svg viewBox="0 0 100 40"><path class="sketch-dot sketch-dot-1" d="M 20,20 C 17,16 23,17 25,21 C 26,25 18,25 20,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-2" d="M 50,20 C 47,17 53,16 55,20 C 56,24 48,26 50,20 Z" fill="currentColor"/><path class="sketch-dot sketch-dot-3" d="M 80,20 C 76,17 84,18 85,22 C 85,25 78,25 80,20 Z" fill="currentColor"/></svg></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. PATCHWORK 3D (Placeholder) -->
                    <div class="fortiche-section patchwork-section">
                        <div class="section-tag font-sketch">RENDUS 3D</div>
                        <p class="font-sketch placeholder-text" style="color: var(--notebook-text); opacity: 0.5; margin-top: 20px;">[ Espace réservé pour le patchwork 3D : Intérieur, Immersion, Vues lointaines ]</p>
                        <div class="patchwork-grid-placeholder" style="min-height: 200px; border: 2px dashed rgba(255,255,255,0.1); margin-top: 20px;">
                             <!-- To be filled later -->
                        </div>
                    </div>

                </div>
"@

$content = Get-Content 'index.html' -Raw -Encoding UTF8
$startStr = '<p class="page-intro"'
$endStr = '<a href="javascript:void(0)" class="page-next"'

$startIndex = $content.IndexOf($startStr)
$endIndex = $content.IndexOf($endStr)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    
    $finalHtml = $before + $newHtml + "`n                " + $after
    Set-Content 'index.html' -Value $finalHtml -Encoding UTF8
    Write-Output "Successfully updated index.html with new Fortiche layout!"
} else {
    Write-Output "Indices not found: $startIndex, $endIndex"
}
========== SCRIPT ==========
$newHtml = Get-Content new_projects.html -Raw
$newHtml += "`n                </div>" # close projects-grid

$content = Get-Content index.html -Raw
$projStart = $content.IndexOf('<section class="page" id="page-projects"')
$gridStart = $content.IndexOf('<div class="projects-grid">', $projStart)
$gridEnd = $content.IndexOf('<a href="javascript:void(0)" class="page-next" data-next="photos"', $gridStart)
$gridEnd = $content.LastIndexOf('<!-- Flèche suivant', $gridEnd)

$before = $content.Substring(0, $gridStart)
$after = $content.Substring($gridEnd)

$finalHtml = $before + $newHtml + "`n`n                " + $after
Set-Content -Path index.html -Value $finalHtml
Write-Output "Injected!"
========== SCRIPT ==========
$content = Get-Content index.html -Raw
$projStart = $content.IndexOf('<section class="page" id="page-projects"')
$gridStart = $content.IndexOf('<div class="projects-grid">', $projStart)
$gridEnd = $content.IndexOf('<a href="javascript:void(0)" class="page-next" data-next="photos"', $gridStart)

$before = $content.Substring(0, $gridStart)
$after = $content.Substring($gridEnd)

# But wait, there are spaces before <a href... Let's backtrack to the <!-- comment
$afterCommentIndex = $content.LastIndexOf('<!--', $gridEnd)
if ($afterCommentIndex -gt $gridStart) {
    $after = $content.Substring($afterCommentIndex)
}

$newHtml = Get-Content new_projects.html -Raw
$newHtml += "`n                </div>"

$finalHtml = $before + $newHtml + "`n`n                " + $after
Set-Content -Path index.html -Value $finalHtml
Write-Output "Injected!"
========== SCRIPT ==========
$content = Get-Content index.html -Raw
$projStart = $content.IndexOf('<section class="page" id="page-projects"')
$gridStart = $content.IndexOf('<div class="projects-grid">', $projStart)
$gridEnd = $content.IndexOf('data-next="photos"', $gridStart)

$afterCommentIndex = $content.LastIndexOf('<!--', $gridEnd)
Write-Output "gridStart: $gridStart, afterCommentIndex: $afterCommentIndex"

$before = $content.Substring(0, $gridStart)
$after = $content.Substring($afterCommentIndex)

$newHtml = Get-Content new_projects.html -Raw
$newHtml += "`n                </div>"

$finalHtml = $before + $newHtml + "`n`n                " + $after
Set-Content -Path index.html -Value $finalHtml -Encoding UTF8
Write-Output "Injected!"
