const app = document.querySelector("#app");

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

function rich(text) {
  const span = document.createElement("span");
  if (!text) return span;
  const re = /to be confirmed by rose/gi;
  let last = 0;
  let match;
  while ((match = re.exec(text))) {
    span.append(document.createTextNode(text.slice(last, match.index)));
    span.append(el("mark", { class: "tbc", text: match[0] }));
    last = match.index + match[0].length;
  }
  span.append(document.createTextNode(text.slice(last)));
  return span;
}

function player(ad) {
  const box = el("div", { class: "player" });
  const video = el("video", {
    controls: "",
    playsinline: "",
    preload: "metadata",
    poster: ad.poster,
    src: ad.video,
  });
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  const fail = el("p", {
    class: "fail",
    text: "This video did not load. Use the Ad Library link on the card.",
  });
  video.addEventListener("error", () => box.classList.add("is-broken"));
  box.append(video, fail);
  const stage = el("div", { class: "stage" }, [box]);
  return stage;
}

function badges(ad) {
  const row = el("div", { class: "badges" });
  if (ad.length) row.append(el("span", { class: "badge", text: ad.length }));
  if (ad.ran) row.append(el("span", { class: "badge", text: ad.ran }));
  if (ad.ran && ad.ran.toLowerCase().includes("still active")) {
    row.append(el("span", { class: "badge live", text: "Still active" }));
  }
  return row;
}

function meta(ad) {
  const list = el("dl", { class: "meta" });
  const rows = [
    ["Hook", ad.hook],
    ["Main scene", ad.scene],
    ["Length", ad.length],
    ["Ran", ad.ran],
    ["Why it works", ad.why],
  ];
  if (ad.note) rows.push(["Note", ad.note]);
  for (const [label, value] of rows) {
    if (!value) continue;
    const wrap = el("div");
    wrap.append(el("dt", { text: label }), el("dd", {}, [rich(value)]));
    list.append(wrap);
  }
  return list;
}

function libraryLink(href, label) {
  return el("a", { class: "library", href, target: "_blank", rel: "noreferrer", text: label || "Open in the Meta Ad Library" });
}

function card(ad) {
  const article = el("article", { class: "card", id: `ad-${ad.id}` });
  article.append(el("h3", { text: ad.title }));
  article.append(player(ad));
  article.append(badges(ad));
  article.append(meta(ad));
  article.append(libraryLink(ad.link, "Ad Library"));
  return article;
}

function section(id, heading, caption) {
  const node = el("section", { id });
  const head = el("div", { class: "section-head" });
  head.append(el("h2", { text: heading }));
  if (caption) head.append(el("p", { text: caption }));
  node.append(head);
  return node;
}

function render(data) {
  app.replaceChildren();
  const nav = document.querySelector("#nav");
  nav.replaceChildren(
    ...data.nav.map((item) => el("a", { href: `#${item.id}`, text: item.label }))
  );

  const intro = el("header", { class: "wrap hero-intro" });
  intro.append(el("p", { class: "eyebrow", text: "Creator onboarding" }));
  intro.append(el("h1", { text: data.title }));
  intro.append(el("p", { class: "lede", text: data.summary }));
  const banner = el("div", { class: "banner" });
  banner.append(el("strong", { text: "For Rose first" }));
  banner.append(rich(data.previewNote));
  intro.append(banner);
  app.append(intro);

  const welcome = section("welcome", data.welcome.heading);
  welcome.classList.add("wrap");
  welcome.append(el("p", {}, [rich(data.welcome.body)]));
  const one = el("div", { class: "callout" });
  one.append(el("strong", { text: data.welcome.oneLineLabel }));
  one.append(rich(data.welcome.oneLine));
  welcome.append(one);
  app.append(welcome);

  const product = section("product", data.product.heading);
  product.classList.add("wrap");
  const facts = el("dl", { class: "facts" });
  for (const fact of data.product.facts) {
    const wrap = el("div");
    const dd = el("dd");
    if (fact.href) dd.append(el("a", { href: fact.href, text: fact.value }));
    else dd.append(rich(fact.value));
    wrap.append(el("dt", { text: fact.label }), dd);
    facts.append(wrap);
  }
  product.append(facts);
  app.append(product);

  const look = section("look", data.filming.heading);
  look.classList.add("wrap");
  look.append(el("ul", { class: "checks" }, data.filming.items.map((item) => el("li", {}, [rich(item)]))));
  app.append(look);

  data.heroes.forEach((hero, index) => {
    const block = section(index === 0 ? "hero1" : "hero2", hero.heading, hero.caption);
    block.classList.add("wrap");
    const grid = el("div", { class: "hero-block" });
    const media = el("div");
    media.append(player({ ...hero, title: hero.heading }));
    media.append(libraryLink(hero.libraryUrl, hero.libraryLabel));
    const table = el("table", { class: "shots" });
    const thead = el("thead");
    const hr = el("tr");
    ["Time", "What you see", "What's said"].forEach((label) => hr.append(el("th", { text: label })));
    thead.append(hr);
    const tbody = el("tbody");
    for (const shot of hero.shots) {
      const tr = el("tr");
      shot.forEach((cell) => tr.append(el("td", {}, [rich(cell)])));
      tbody.append(tr);
    }
    table.append(thead, tbody);
    const copy = el("div");
    copy.append(table, el("p", {}, [rich(hero.why)]));
    grid.append(media, copy);
    block.append(grid);
    app.append(block);
  });

  const gallery = section("gallery", data.gallery.heading, data.gallery.caption);
  gallery.classList.add("wrap");
  gallery.append(el("p", {}, [rich(data.gallery.intro)]));
  app.append(gallery);

  for (const group of data.groups) {
    const node = section(group.id, group.heading);
    node.classList.add("wrap", "group");
    node.append(el("p", {}, [rich(group.intro)]));
    node.append(el("div", { class: "cards" }, group.ads.map(card)));
    app.append(node);
  }

  const real = section(data.realUse.id, data.realUse.heading, data.realUse.caption);
  real.classList.add("wrap");
  real.append(el("div", { class: "cards pair" }, data.realUse.ads.map(card)));
  app.append(real);

  const shared = section("patterns", data.shared.heading, data.shared.caption);
  shared.classList.add("wrap");
  const max = Math.max(...data.shared.bars.map((bar) => bar.value));
  const bars = el("div", { class: "bars" });
  data.shared.bars.forEach((bar, index) => {
    const row = el("div", { class: "bar-row" });
    row.append(el("div", { class: "bar-label", text: bar.label }));
    row.append(el("strong", { text: `${bar.value} ads` }));
    const track = el("div", { class: "track" });
    const fill = el("span");
    fill.style.width = `${(bar.value / max) * 100}%`;
    if (index === 0) fill.style.background = "linear-gradient(90deg, #1f8a84, #f0a202)";
    track.append(fill);
    row.append(track);
    bars.append(row);
  });
  const points = el("ol", { class: "steps" });
  data.shared.points.forEach((point) => points.append(el("li", {}, [rich(point)])));
  shared.append(bars, points);
  app.append(shared);

  const scripts = section("scripts", data.scripts.heading);
  scripts.classList.add("wrap");
  scripts.append(el("p", {}, [rich(data.scripts.intro)]));
  for (const script of data.scripts.items) {
    const box = el("article", { class: "script" });
    const header = el("header");
    header.append(el("h3", { text: script.title }));
    const button = el("button", { type: "button", text: "Copy" });
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(script.body);
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = "Copy"; }, 1400);
      } catch {
        button.textContent = "Select the text";
      }
    });
    header.append(button);
    box.append(header, el("pre", { text: script.body }));
    scripts.append(box);
  }
  app.append(scripts);

  const hooks = section("hooks", data.hooks.heading, data.hooks.caption);
  hooks.classList.add("wrap");
  hooks.append(el("ol", { class: "hooks" }, data.hooks.items.map((item) => el("li", {}, [rich(item)]))));
  app.append(hooks);

  const dos = section("dos", data.dos.heading);
  dos.classList.add("wrap");
  const split = el("div", { class: "split" });
  const doCol = el("article", { class: "do" });
  doCol.append(el("h3", { text: "Do" }), el("ul", { class: "checks" }, data.dos.dos.map((item) => el("li", {}, [rich(item)]))));
  const dontCol = el("article", { class: "dont" });
  dontCol.append(el("h3", { text: "Don't" }), el("ul", { class: "checks" }, data.dos.donts.map((item) => el("li", {}, [rich(item)]))));
  split.append(doCol, dontCol);
  const claims = el("div", { class: "callout warn" });
  claims.append(el("strong", { text: data.dos.claimsLabel }));
  claims.append(rich(data.dos.claims));
  dos.append(split, claims);
  app.append(dos);

  const deliver = section("deliverables", data.deliverables.heading);
  deliver.classList.add("wrap");
  const dlist = el("dl", { class: "deliver" });
  for (const item of data.deliverables.items) {
    const wrap = el("div");
    wrap.append(el("dt", { text: item.label }), el("dd", {}, [rich(item.value)]));
    dlist.append(wrap);
  }
  deliver.append(dlist);
  app.append(deliver);

  const submit = section("submit", data.submit.heading);
  submit.classList.add("wrap");
  const steps = el("ol", { class: "steps" });
  for (const step of data.submit.steps) {
    const li = el("li");
    li.append(el("strong", { text: step.title }), document.createTextNode(" "), rich(step.detail));
    steps.append(li);
  }
  const questions = el("div", { class: "callout" });
  questions.append(el("strong", { text: data.submit.questionsLabel }));
  questions.append(rich(data.submit.questions));
  submit.append(steps, questions);
  app.append(submit);

  const foot = el("footer", { class: "wrap" });
  foot.append(rich("TinyStroke · tinystroke.com · washable twist crayons for toddlers."));
  app.append(foot);
}

fetch("content.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load content.json");
    return response.json();
  })
  .then(render)
  .catch((error) => {
    app.className = "wrap status error";
    app.textContent = error.message;
  });
