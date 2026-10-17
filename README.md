# رالي الخليج | Gulf Rally

سباق تطعيس ثلاثي الأبعاد: أنت بلاندكروزر بيضا ضد باترول أحمر في صحراء قطر.

A pseudo-3D desert rally: your white Land Cruiser vs. the red Patrol.

## التحكم | Controls
| الزر | وش يسوي |
|---|---|
| **A** | بنزين |
| **B** | فرامل، ومع ⬅️➡️ = **تفحيط** (يعبّي عداد النيترو) |
| ⬅️ ➡️ | لف |
| ⬆️ | نيترو (تجمعه من الطريق) |

## في الطريق | On the track
- **جمال تعبر الطريق**: لوحة التحذير تنبهك قبلها
- **سبخة بيضا**: زلقة، والسيارة تنزلق للخارج
- **جالونات بنزين**: البنزين ينقص، لا يخلص عليك
- **منصات قفز**: انزل وأنت مستقيم، لو لافّ تنقلب
- **التفحيط**: B + لف في المنحنيات، عداد DRIFT يتعبى ويعطيك نيترو
- **الباترول الأحمر**: لازم توصل خط النهاية قبله

## للطلاب: غيّروا | Students: try changing
- `MAX_SPEED`, `FUEL_USE`, `CENTRIFUGAL` في أول الكود
- صمموا مساركم في `buildTrack()`: `addStraight`, `addCurve`, `addDune`, `addJump`, `addSabkha`, `addProp`

> Open in https://arcade.makecode.com → Import → Import URL
