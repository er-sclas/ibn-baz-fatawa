/* Rank fatwas by the key terms of a phrase.

   A term is a word that is not a filler ("the", "ruling", "of").
   Terms that name the same thing — prayer and ṣalāh, fasting and ṣiyām —
   count as one term, so the phrase does not have to copy the fatwa's wording.
   A fatwa ranks higher when the terms land in its title, then its subject,
   then its text, and when it covers more of the terms.
*/
(function (root) {
  var GROUPS = [
    ["prayer", "prayers", "salah", "salat", "salaah", "صلاه"],
    ["wudu", "wudhu", "wuzu", "ablution", "وضوء"],
    ["ghusl", "غسل"],
    ["janabah", "janaba", "جنابه"],
    ["jumuah", "jummah", "juma", "friday", "جمعه"],
    ["zakah", "zakat", "zakaat", "زكاه", "زكاة"],
    ["fitr", "fitrah", "فطر"],
    ["fast", "fasting", "fasts", "siyam", "sawm", "saum", "صيام", "صوم"],
    ["ramadan", "ramadhan", "رمضان"],
    ["cupping", "hijama", "hijamah", "حجامه"],
    ["imam", "imaam", "امام"],
    ["taslim", "تسليم"],
    ["kufr", "disbelief", "disbeliever", "disbelieves", "kafir", "كفر"],
    ["movement", "movements", "moving"],
    ["invalidate", "invalidates", "invalidated", "invalid", "break", "breaks", "broken"],
    ["wipe", "wipes", "wiped", "wiping"],
    ["leaving", "abandon", "abandoning", "abandoned"],
    ["tahur", "purifying", "purify"],
    ["najis", "impure", "impurity", "impurities"],
    ["hadath", "حدث"],
    ["water", "waters", "ماء", "مياه"],
    ["head", "راس"],
    ["sutrah", "sutra"],
    ["istiwa", "istawa", "rose", "rising", "throne", "استوى", "استواء"],
    ["uluww", "above", "highness", "علو"],
    ["descent", "descends", "nuzul", "نزول", "ينزل"],
    ["shin", "saq", "ساق"],
    ["hand", "hands", "yad", "يد"],
    ["face", "wajh", "وجه"],
    ["tawil", "interpretation", "تاويل"],
    ["attribute", "attributes", "sifat", "صفات"],
    ["names", "asma", "اسماء"],
    ["songs", "song", "singing", "music", "musical", "instruments", "ghina", "اغاني", "غناء"],
    ["nasheed", "nasheeds", "nashid", "anashid", "اناشيد"],
    ["menstruation", "menstruating", "menses", "period", "periods", "hayd", "haid", "haidh", "حيض", "حائض"],
    ["nifas", "postpartum", "نفاس"],
    ["socks", "sock", "khuff", "khuffs", "khuffayn", "footwear", "leather", "جورب", "خف"],
    ["tayammum", "dust", "تيمم"],
    ["beard", "lihya", "لحيه"],
    ["dye", "dyeing", "black", "hair"],
    ["isbal", "trousers", "garment", "ankles", "اسبال"],
    ["pictures", "picture", "photo", "photos", "photograph", "photographs", "images", "تصوير", "صور"],
    ["bank", "banks", "banking", "interest", "riba", "usury", "loan", "loans", "mortgage", "ربا", "بنك"],
    ["sorcery", "magic", "sihr", "fortune", "soothsayer", "soothsayers", "astrologer", "astrologers", "horoscope", "kahin", "سحر", "كهانه"],
    ["amulet", "amulets", "tamimah", "taweez", "talisman", "تميمه", "تمائم"],
    ["mawlid", "mawlid", "birthday", "milad", "celebration", "celebrating", "مولد", "موالد"],
    ["bidah", "innovation", "innovations", "بدعه"],
    ["swearing", "swear", "oath", "oaths", "حلف"],
    ["graves", "grave", "graveyard", "cemetery", "قبور", "مقابر"],
    ["eid", "id", "عيد"],
    ["witr", "وتر"],
    ["qiyam", "tarawih", "taraweeh", "tahajjud", "night"],
    ["istikharah", "istikhara", "استخاره"],
    ["sahw", "forgetfulness", "forgot", "forget", "doubt", "سهو"],
    ["combining", "combine", "jam", "جمع"],
    ["hajj", "pilgrimage", "حج"],
    ["divorce", "talaq", "طلاق"],
    ["marriage", "nikah", "marry", "زواج", "نكاح"],
    ["masturbation", "masturbate", "istimna", "استمناء"],
    ["handshake", "shaking", "shake", "hands", "مصافحه"],
    ["women", "woman", "wife", "female", "نساء", "مراه"],
    ["jewellery", "jewelry", "gold", "ذهب", "حلي"],
    ["suhur", "suhoor", "sahur", "adhan", "azan", "سحور", "اذان"],
    ["missed", "qada", "qadha", "makeup", "قضاء"],
    ["qadr", "laylat", "laylatul", "قدر"],
    ["discharge", "fluid", "rutubah", "رطوبه"],
    ["waswasah", "waswas", "whispers", "doubts", "وسوسه"],
    ["incontinence", "urine", "bol", "سلس", "بول"]
  ];

  var STOP_WORDS = (
    "a an the of on in for to and or is are was were be been being " +
    "what how does do did doing this that these those it its his her " +
    "their them he she we you your our with from by at as if not no " +
    "yes can may should would will just only also some such very when " +
    "where why which who whom whose have has had about while during " +
    "into over under than then there here per via within without " +
    "between among upon unto one ones ruling rulings question answer " +
    "al " +
    "في من على عن الى إلي إلى ما لا لم لن قد هو هي هم هن هذا هذه ذلك تلك " +
    "ان أو و ثم كل عند حتى اذا كما يا اي التي الذي الذين حكم السؤال الجواب"
  );

  var FOLD_LATIN = {
    "ṣ": "s", "š": "s", "ş": "s",
    "ṭ": "t", "ḍ": "d", "ẓ": "z", "ḥ": "h",
    "ā": "a", "ī": "i", "ū": "u",
    "ʿ": "", "ʾ": "", "ʼ": "", "’": "", "'": "", "‘": ""
  };

  function foldChar(ch) {
    if (FOLD_LATIN[ch] !== undefined) return FOLD_LATIN[ch];
    if (ch === "أ" || ch === "إ" || ch === "آ" || ch === "ٱ") return "ا";
    if (ch === "ى") return "ي";
    if (ch === "ة") return "ه";
    if (ch === "ؤ") return "و";
    if (ch === "ئ") return "ي";
    return ch;
  }

  function fold(word) {
    var lower = word.toLowerCase();
    var out = "";
    for (var i = 0; i < lower.length; i++) out += foldChar(lower.charAt(i));
    return out;
  }

  function tokenize(text) {
    var raw = String(text).match(/[\p{L}\p{N}]+/gu) || [];
    var tokens = [];
    for (var i = 0; i < raw.length; i++) {
      var token = fold(raw[i]);
      if (token) tokens.push(token);
    }
    return tokens;
  }

  var STOP = new Set(tokenize(STOP_WORDS));
  var ALIAS = new Map();
  GROUPS.forEach(function (group) {
    var folded = group.map(fold).filter(Boolean);
    folded.forEach(function (form) { ALIAS.set(form, folded); });
  });

  function expand(term) {
    return ALIAS.get(term) || [term];
  }

  function keyTerms(phrase) {
    var raw = String(phrase).match(/[\p{L}\p{N}]+/gu) || [];
    var terms = [];
    var seen = new Set();
    raw.forEach(function (word) {
      var token = fold(word);
      if (!token || token.length < 2 || STOP.has(token) || seen.has(token)) return;
      seen.add(token);
      terms.push({ token: token, display: word });
    });
    return terms;
  }

  function sentencesOf(text) {
    return String(text)
      .replace(/[*_`]/g, "")
      .split(/\n+/)
      .map(function (line) { return line.replace(/^>\s?/, "").trim(); })
      .filter(Boolean)
      .flatMap(function (line) { return line.split(/(?<=[.?!])\s+/); })
      .map(function (line) { return line.trim(); })
      .filter(Boolean);
  }

  function bm25(tf, dl, avgdl, idf) {
    var k1 = 1.2;
    var b = 0.75;
    var norm = avgdl ? dl / avgdl : 1;
    return idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * norm));
  }

  function fieldScore(tokens, forms, avgdl, idf) {
    var wanted = new Set(forms);
    var tf = 0;
    var best = 0;
    var seen = new Set();
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (!wanted.has(token)) continue;
      tf++;
      if (!seen.has(token)) {
        seen.add(token);
        best = Math.max(best, idf.get(token) || 0);
      }
    }
    if (!tf) return 0;
    return bm25(tf, tokens.length, avgdl, best);
  }

  function average(docs, key) {
    if (!docs.length) return 1;
    var sum = 0;
    docs.forEach(function (doc) { sum += doc[key].length; });
    return sum / docs.length || 1;
  }

  function prepare(raw) {
    var docs = raw.map(function (doc) {
      var english = sentencesOf(doc.text || "");
      var arabic = sentencesOf(doc.arabic || "");
      return {
        id: doc.id,
        title: doc.title,
        place: doc.place,
        english: english,
        arabic: arabic,
        titleTokens: tokenize(doc.title),
        placeTokens: tokenize(doc.place),
        bodyTokens: tokenize(english.join(" ") + " " + arabic.join(" "))
      };
    });
    var df = new Map();
    docs.forEach(function (doc) {
      var seen = new Set(doc.titleTokens.concat(doc.placeTokens, doc.bodyTokens));
      seen.forEach(function (token) { df.set(token, (df.get(token) || 0) + 1); });
    });
    var n = docs.length;
    var idf = new Map();
    df.forEach(function (count, token) {
      idf.set(token, Math.log(1 + (n - count + 0.5) / (count + 0.5)));
    });
    return {
      docs: docs,
      idf: idf,
      avg: {
        title: average(docs, "titleTokens"),
        place: average(docs, "placeTokens"),
        body: average(docs, "bodyTokens")
      }
    };
  }

  function rank(index, phrase) {
    var terms = keyTerms(phrase);
    if (!terms.length || !index) return { terms: terms, hits: [] };
    var hits = [];
    index.docs.forEach(function (doc) {
      var score = 0;
      var matched = [];
      terms.forEach(function (term) {
        var forms = expand(term.token);
        var part = (
          5 * fieldScore(doc.titleTokens, forms, index.avg.title, index.idf) +
          3 * fieldScore(doc.placeTokens, forms, index.avg.place, index.idf) +
          fieldScore(doc.bodyTokens, forms, index.avg.body, index.idf)
        );
        if (part > 0) {
          matched.push(term);
          score += part;
        }
      });
      if (!matched.length) return;
      score *= 0.2 + 0.8 * (matched.length / terms.length);
      hits.push({ doc: doc, score: score, matched: matched });
    });
    hits.sort(function (a, b) {
      return b.score - a.score || b.matched.length - a.matched.length || (a.doc.title < b.doc.title ? -1 : 1);
    });
    return { terms: terms, hits: hits };
  }

  function formsOf(terms) {
    var forms = new Set();
    terms.forEach(function (term) {
      expand(term.token).forEach(function (form) { forms.add(form); });
    });
    return forms;
  }

  function hitsIn(sentence, forms) {
    var count = 0;
    var seen = new Set();
    tokenize(sentence).forEach(function (token) {
      if (forms.has(token) && !seen.has(token)) {
        seen.add(token);
        count++;
      }
    });
    return count;
  }

  function windowAround(sentence, forms) {
    if (sentence.length <= 280) return sentence;
    var matchAt = sentence.length;
    var parts = sentence.split(/([\s]+)/);
    var offset = 0;
    for (var i = 0; i < parts.length; i++) {
      if (forms.has(fold(parts[i]))) {
        matchAt = offset;
        break;
      }
      offset += parts[i].length;
    }
    var start = Math.max(0, matchAt - 90);
    var end = Math.min(sentence.length, start + 280);
    var slice = sentence.slice(start, end).trim();
    if (start > 0) slice = "… " + slice;
    if (end < sentence.length) slice += " …";
    return slice;
  }

  function snippet(doc, terms) {
    var forms = formsOf(terms);
    var best = "";
    var bestHits = 0;
    var arabic = false;
    function consider(list, isArabic) {
      list.forEach(function (sentence) {
        var count = hitsIn(sentence, forms);
        if (count > bestHits) {
          bestHits = count;
          best = sentence;
          arabic = isArabic;
        }
      });
    }
    consider(doc.english, false);
    if (!bestHits) consider(doc.arabic, true);
    return { text: best ? windowAround(best, forms) : "", arabic: arabic, forms: forms };
  }

  function paint(el, text, forms) {
    var parts = text.split(/([^\p{L}\p{N}]+)/u);
    parts.forEach(function (part) {
      if (!part) return;
      if (forms.has(fold(part))) {
        var mark = document.createElement("mark");
        mark.textContent = part;
        el.appendChild(mark);
      } else {
        el.appendChild(document.createTextNode(part));
      }
    });
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function render(list, result) {
    list.textContent = "";
    var head = el("div", "results-head");
    var count = el("p", "result-count");
    head.appendChild(count);
    list.appendChild(head);
    if (!result.terms.length) {
      count.textContent = "Type a word to search, such as prayer, water, or fasting.";
      return;
    }
    var words = result.terms.map(function (term) { return "“" + term.display + "”"; }).join(", ");
    if (!result.hits.length) {
      count.textContent = "No fatwa matches " + words + ". Try another word, or browse the topics below.";
      return;
    }
    var noun = result.hits.length === 1 ? "fatwa" : "fatwas";
    count.textContent = result.hits.length + " " + noun + " for " + words;
    var rows = el("ol", "rows");
    result.hits.forEach(function (hit) {
      var li = el("li", "row");
      var card = el("a", "row-link");
      card.href = "fatwa/" + hit.doc.id + ".html";
      card.appendChild(el("span", "row-title", hit.doc.title));
      var snip = snippet(hit.doc, result.terms);
      if (snip.text) {
        var body = el("span", "row-summary");
        if (snip.arabic) { body.lang = "ar"; body.dir = "rtl"; }
        paint(body, snip.text, snip.forms);
        card.appendChild(body);
      }
      var meta = el("span", "row-meta");
      var tag = el("span", "tag " + (hit.doc.status === "Approved" ? "approved" : "draft"), hit.doc.status || "Draft");
      meta.appendChild(tag);
      meta.appendChild(el("span", "row-place", hit.doc.place));
      card.appendChild(meta);
      li.appendChild(card);
      rows.appendChild(li);
    });
    list.appendChild(rows);
  }

  function bind() {
    var input = document.getElementById("q");
    var list = document.getElementById("result-list");
    var results = document.getElementById("results");
    var browse = document.getElementById("browse");
    if (!input || !list || !results || !root.FATWA_INDEX) return;
    var index = prepare(root.FATWA_INDEX);
    function show() {
      var phrase = input.value;
      if (!phrase.trim()) {
        results.hidden = true;
        if (browse) browse.hidden = false;
        list.textContent = "";
        return;
      }
      render(list, rank(index, phrase));
      results.hidden = false;
      if (browse) browse.hidden = true;
    }
    function remember() {
      try {
        var url = new URL(location.href);
        if (input.value.trim()) url.searchParams.set("q", input.value.trim());
        else url.searchParams.delete("q");
        history.replaceState(null, "", url);
      } catch (e) {}
    }
    input.addEventListener("input", function () { show(); remember(); });
    if (input.form) input.form.addEventListener("submit", function (event) { event.preventDefault(); show(); remember(); });
    var start = "";
    try { start = new URLSearchParams(location.search).get("q") || ""; } catch (e) {}
    if (start) {
      input.value = start;
      show();
    }
    var header = document.getElementById("hq");
    if (header && header.form) {
      // On the home page the header field drives the same results.
      header.form.addEventListener("submit", function (event) {
        event.preventDefault();
        input.value = header.value;
        header.value = "";
        show();
        remember();
        input.focus();
      });
    }
  }

  root.FatwaSearch = {
    keyTerms: keyTerms,
    prepare: prepare,
    rank: rank,
    snippet: snippet,
    tokenize: tokenize
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
    else bind();
  }
})(typeof window !== "undefined" ? window : globalThis);
