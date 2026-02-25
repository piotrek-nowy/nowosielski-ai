-- Seed: 2 istniejące wpisy z MDX (treść przekonwertowana na HTML)
-- Uruchom po migracji 001_posts.sql (tabela posts + RLS).

insert into public.posts (
  title,
  slug,
  content,
  excerpt,
  cover_image_url,
  category,
  lang,
  published,
  published_at,
  created_at,
  updated_at
) values
(
  'Vibe coding — dzień 1',
  'vibe-coding-dzien-1',
  $$<p>Chodziło to za mną przez kilka ostatnich tygodni, aby w końcu przestać tylko gadać o tym, czego to nie da się zrobić z wykorzystaniem AI w programowaniu, tylko spróbować postawić coś „samodzielnie".</p>
<p>W weekend stworzyłem sobie papierową instrukcję/podręcznik „programowanie z AI", aby w końcu przygotować się do odpalenia pierwszego samodzielnego projektu online z wykorzystaniem kombinacji ai-native tech stack.</p>
<p>W zasadzie to przez kilka godzin rozmawiałem z Claude Opus 4.6, pytając go o to, jak zacząć programować z AI, jaki tech stack wybrać, jak to wszystko zainstalować, jak skonfigurować hosting, podpiąć domenę, korzystać z githuba i czym jest to całe repozytorium.</p>
<p>Tłumaczył, a ja pytałem, drążyłem, próbując to wszystko jakoś zrozumieć.</p>
<p>Pytałem o możliwie najlepszy AI tech stack. Do tego z łopatologiczną instrukcją jak dla 5-latka o tym, jak korzystać z tych wszystkich narzędzi, ze słownikiem kilkudziesięciu pojęć na końcu (m.in. co to HTML, co to commit, pull request, git, github, biblioteka…. no trochę tego jest… powiedzmy, że podchodzę do tego w szkolny sposób. Back to basics. :)</p>
<p>Tak oto udało się skompletować instrukcję, która liczy ponad 30 stron. Wydrukowałem ją sobie i zacząłem sobie czytać i lecieć wg niej + dopytywać o wszystko Claude.</p>
<h2>Co tam mi wyszło w kilku krokach na pierwszy dzień</h2>
<ol>
<li><strong>Kupno domeny: Cloudflare</strong> — dość tego home.pl… Postawiłem na ekstrawaganckie nowosielski.ai, w sumie z racji tego, że inne kombinacje mojego imienia i nazwiska już mam na firmowych hostingach, a nie chciało mi się z tego korzystać.</li>
<li><strong>Hosting: Vercel</strong> — sprawia wrażenie mocno AI/startup vibe. Tu jeszcze ogarnięcie DNS itp.</li>
<li><strong>Instalacje: git, node.js, Cursor IDE, Claude Code</strong> — trzeba było to zrobić z poziomu terminala na Mac, co nie było dla mnie najłatwiejsze, szczególnie, że nigdy nie odpalałem takich rzeczy, może poza sytuacją, gdy przypadkowo wyklikałem jakąś kombinację przycisków.</li>
<li><strong>Konto na GitHub</strong> — przechowuje kod w chmurze, zarządza wersjami (jeszcze dokładnie nie wiem, co to znaczy), źródło dla Vercel. Co więcej, wszystko spięło się w taki sposób, że udało się zrobić automatyczny deploy z Github.</li>
<li><strong>Odpalenie Cursora na Mac i podpięcie wszystkich tych programów między sobą</strong> (Vercel, Github, Cloudflare) — jak się okazuje, one są już tak połapane, że wszystko idzie praktycznie jednym klikiem.</li>
<li><strong>Stworzenie „promptu inicjalnego"</strong> ze zdefiniowaniem tego, co chcę zrobić — który przygotował mi też Claude. Opisałem jakie chcę mieć sekcje na stronie i co to ma być — w skrócie, po prostu stronka domowa.</li>
<li><strong>Wrzuciłem ten prompt inicjalny do agenta odpalonego w Cursorze</strong> — to było w sumie śmieszne, bo trochę miałem opory przed tym, aby wrzucić go tam po raz pierwszy i zobaczyć, jak to się wszystko kręci. Parę dobrych minut mu to zajęło, ale wypluł mi pierwszą wersję strony, trochę go pomęczyłem o zmianach, następnie nauczyłem się tam pierwszej komendy <code>git add</code> + <code>git commit</code> z opisem, co zmieniam + <code>git push</code>, aby to poszło dalej.</li>
<li><strong>W tym momencie dopiero podpiąłem domenę live pod Vercel.</strong> Chwilę poczekałem i nowosielski.ai poszło live.</li>
<li><strong>Pojawił się też pierwszy commit</strong> w moim repozytorium na githubie na profilu piotrek_nowy.</li>
<li><strong>Trochę pozmieniałem tą stronę</strong> — pobawiłem się warstwą wizualną i poprzestawiałem sobie kolumny, czy zmieniłem font, uprościłem koncepcję, a na koniec jeszcze dodałem część blogową — ale taką jeszcze bez Supabase. Tak oto zamknął się dzień nr 1. Łącznie 5,5 godziny.</li>
</ol>
<p>—</p>
<p>Start mogę uznać za udany i dość lekki. Niewiele rozumiem z narzędzi, z których korzystam, ale dzięki AI poszło to po prostu tak, jakbym czytał instrukcję z Ikei do składania średnio skomplikowanego mebla.</p>$$,
  'Chodziło to za mną przez kilka ostatnich tygodni, aby w końcu przestać tylko gadać o tym, czego to nie da się zrobić z wykorzystaniem AI w programowaniu, tylko spróbować postawić coś samodzielnie. W weekend stworzyłem papierową instrukcję programowania z AI, przez kilka godzin rozmawiałem z Claude Opus 4.6 o tech stacku, instalacji, hostingu i GitHubie. Wydrukowałem 30-stronicowy podręcznik i ruszyłem. Kupno domeny, Vercel, instalacje, pierwszy prompt w Cursorze, pierwszy commit, deploy — 5,5 godziny i nowosielski.ai poszło live.',
  null,
  'Dziennik',
  'pl',
  true,
  '2026-02-23T12:00:00+00:00',
  '2026-02-23 12:00:00+00',
  '2026-02-23 12:00:00+00'
),
(
  'Projekty na tapecie',
  'projekty-na-tapecie',
  $$<p>Przez noc oczywiście głowa pracowała i rozmyślałem, co tam kolejnego chciałbym zbudować, aby sprawdzić różne możliwości vibe coding i to, jak to wszystko się spina, integrując przy tym różne zewnętrzne narzędzia, czy tworząc je „samodzielnie". Człowiek wstał rano i spisał sobie kilkanaście tematów. Część wydaje się prosta, część nieco bardziej skomplikowana, wszystko jest raczej w zasięgu. Zobaczymy.</p>
<h2>Co kolejnego chciałbym zbudować</h2>
<ol>
<li>Podpiąć feed z mojego X po założeniu konta deweloperskiego na tym serwisie</li>
<li>Postawić bloga na Supabase z opcją logowania i edytorem tekstu — ogarnąć o co z tym chodzi</li>
<li>Notatnik (za logowaniem) w stylu Airtable: nad czym pracowałem, czas zadania i poziom trudności</li>
<li>Podpiąć bloga do newslettera, który będzie wysyłał każdy mój nowy wpis i zrobić tu automatyzację</li>
<li>Proste Calendly do złapki ze mną z automatycznym dodawaniem do kalendarza Google</li>
<li>Jakieś proste gry: snake, saper, pasjans solitaire</li>
<li>Może bardziej skomplikowane gry jak szachy z różnymi skórkami szachownicy</li>
<li>Szachy z możliwością zagrania ze mną online asynchronicznie (po rejestracji)</li>
<li>Zintegrowanie się z jakimś zewnętrznym API</li>
<li>Podpięcie płatności pod zakup czegoś</li>
</ol>
<h2>Lista rzeczy z mojej branży</h2>
<ol>
<li>Wizualizacje wykresów na bazie danych z naszych job boardów po API Snowflake</li>
<li>Zbudowanie własnej wtyczki do przeglądarki do czegoś, np. scraping ofert pracy</li>
<li>Coś pod e-learning, na przykład generator mini-kursu po wrzuceniu linku z YouTube</li>
<li>Zbudowanie agregatora newsów o rynku pracy</li>
<li>Zbudowanie prostego generatora CV</li>
</ol>
<h2>Znacznie bardziej rozbudowane struktury</h2>
<ol>
<li>Nasz wewnętrzny TomHRM — do urlopów dla firmy</li>
<li>Mini-platforma edukacyjna z kursami do nauki na podstawie dostarczonych materiałów</li>
</ol>
<p>Na razie tyle, co przychodzi mi do głowy, listę będę sobie aktualizował na bieżąco w kolejnych wersjach tego pliku.</p>
<h2>Oczekiwania co do tempa</h2>
<p>Jeśli byłbym w stanie pracować 1 dzień (5h) nad jednym tematem z listy 1–10 (w sumie 10 tematów × 5h = 50h) i trzy dni robocze nad tematami z listy branżowej (5 tematów × 15h = 75h) to wychodzi na to, że potrzebowałbym około 125h. Tematów znacznie większych nawet nie wliczam tutaj czasowo. Jest to po prostu zbyt rozbudowany temat.</p>
<p>Czyli jesteśmy mniej więcej na końcu kwartału, zakładając optymistyczne i bardzo wysokie tempo 5h dziennie. Jeśli byłbym w stanie 130h nauczyć się trochę to w sumie czemu nie. Biorąc pod uwagę, że pewnie z paru tematach zakopię się na długie godziny, bo już wkurwiałem się na to, jak źle napisałem jakąś komendę, bo nie dałem tylu myślników, ilu trzeba, to podejrzewam, że przy tych zadaniach problemy zaczną rosnąć wykładniczo. Jak skończę listę 1–10 do końca kwartału, to będę usatysfakcjonowany. Wszystkie wątki z kronikarskim obowiązkiem będę sobie tutaj notował + dodawał do notatnika (punkt 3) w kwestii czasu.</p>
<p>—</p>
<p>Ciekawe, jak to trzeba będzie zbudować, aby połączyć te wszystkie elementy bezpośrednio na jednym serwisie. Chcę to tworzyć w jednym miejscu, aby lepiej orientować się, jak budować nieco bardziej rozbudowane struktury i jak robić ten vibe coding, który ma być sensowny również przy bardziej złożonych tematach. Budujemy zatem tego Frankensteina… :)</p>
<p>Stay tuned!</p>$$,
  'Przez noc głowa pracowała i rano spisałem kilkanaście projektów, które chcę zbudować w ramach nauki vibe codingu. Od podpięcia feeda z X, przez bloga na Supabase, newsletter, gry, szachy online, płatności, aż po wizualizacje danych z job boardów i generator CV. Wszystko na jednym serwisie — budujemy Frankensteina.',
  null,
  'AI',
  'pl',
  true,
  '2026-02-24T12:00:00+00:00',
  '2026-02-24 12:00:00+00',
  '2026-02-24 12:00:00+00'
);
