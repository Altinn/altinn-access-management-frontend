
<h3>❌ Playwright AT23</h3>
<p>
❌ 3 feilet · ⚠️ 2 ustabile · ✅ 112 bestått · ⏭️ 1 hoppet over ·
6 min · <a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/">Åpne Playwright-rapporten</a>
</p>
<details>
<summary>❌ <b>samtykke › Samtykke › Godkjenn samtykke fra person</b></summary>
<p>
<code>e2eTests/samtykke/samtykke.spec.ts:27</code> · 2
forsøk · <a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/#?testId=t1abc123">Åpne testen i rapporten</a>
</p>
<pre>Error: expect(locator).toBeVisible() failed&#10;&#10;Locator: getByRole(&#39;button&#39;, { name: &#39;Godkjenn&#39; })&#10;Expected: visible&#10;Timeout: 15000ms&#10;Error: element(s) not found&#10;&#10;Call log:&#10;  - Expect &quot;toBeVisible&quot; with timeout 15000ms&#10;  - waiting for getByRole(&#39;button&#39;, { name: &#39;Godkjenn&#39; })</pre>
</details><details>
<summary>❌ <b>systemuser › Systembruker › Opprett klientsystembruker</b></summary>
<p>
<code>e2eTests/systemuser/systemuser.spec.ts:34</code> · 2
forsøk · <a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/#?testId=t2abc123">Åpne testen i rapporten</a>
</p>
<pre>Error: apiRequestContext.post: 500 Internal Server Error&#10;POST https://platform.at23.altinn.cloud/authentication/api/v1/systemregister/vendor&#10;{&quot;title&quot;:&quot;Internal Server Error&quot;,&quot;status&quot;:500}</pre>
</details><details>
<summary>❌ <b>tilgangspakker › Tilgangspakker › Deleger pakke til virksomhet</b></summary>
<p>
<code>e2eTests/tilgangspakker/tilgangspakker.spec.ts:41</code> · 2
forsøk · <a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/#?testId=t3abc123">Åpne testen i rapporten</a>
</p>
<pre>TimeoutError: page.goto: Timeout 30000ms exceeded.&#10;Call log:&#10;  - navigating to &quot;https://am.ui.at23.altinn.cloud/accessmanagement/ui/users&quot;, waiting until &quot;load&quot;</pre>
</details> <details>
<summary>⚠️ <b>2 ustabile tester</b> (bestod på nytt forsøk)</summary>
<ul>
<li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/#?testId=t4abc123">fullmakter › Fullmakter › Gi fullmakt til person</a>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/#?testId=t5abc123">klientadministrasjon › Klientadministrasjon › Legg til klient</a>
</li>
</ul>
</details>



<h3>🔴 Universell utforming AT23</h3>
<p>
Regler med brudd: 🔴 3 alvorlige · ⚠️ 2 moderate · ℹ️ 1 mindre alvorlige ·
23 skanninger · <a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/index.html">Åpne UU-rapporten</a>
</p>
<details>
<summary>
🔴 <b>Form elements must have labels</b> <code>label</code> –
1 skanning,
1 element
</summary>
<ul>
<li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-1.html">samtykke – startside</a> <code>/consent/request</code>
</li>
</ul>
<p><a href="https://dequeuniversity.com/rules/axe/4.10/label">Om regelen (axe)</a></p>
</details><details>
<summary>
🔴 <b>Elements must only use supported ARIA attributes</b> <code>aria-allowed-attr</code> –
1 skanning,
2 elementer
</summary>
<ul>
<li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-2.html">systemuser – oversikt</a> <code>/systemuser/overview</code>
</li>
</ul>
<p><a href="https://dequeuniversity.com/rules/axe/4.10/aria-allowed-attr">Om regelen (axe)</a></p>
</details><details>
<summary>
🔴 <b>Elements must meet minimum color contrast ratio thresholds</b> <code>color-contrast</code> –
2 skanninger,
8 elementer
</summary>
<ul>
<li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-1.html">samtykke – startside</a> <code>/consent/request</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-3.html">fullmakter – dialog</a> <code>/users/person</code>
</li>
</ul>
<p><a href="https://dequeuniversity.com/rules/axe/4.10/color-contrast">Om regelen (axe)</a></p>
</details><details>
<summary>
⚠️ <b>All page content should be contained by landmarks</b> <code>region</code> –
6 skanninger,
36 elementer
</summary>
<ul>
<li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-2.html">systemuser – oversikt</a> <code>/systemuser/overview</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-3.html">fullmakter – dialog</a> <code>/users/person</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-4.html">header – steg0</a> <code>/side-0</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-9.html">idporten – steg5</a> <code>/side-5</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-14.html">forespoersler – steg10</a> <code>/side-10</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-19.html">uu – steg15</a> <code>/side-15</code>
</li>
</ul>
<p><a href="https://dequeuniversity.com/rules/axe/4.10/region">Om regelen (axe)</a></p>
</details><details>
<summary>
⚠️ <b>Heading levels should only increase by one</b> <code>heading-order</code> –
4 skanninger,
4 elementer
</summary>
<ul>
<li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-4.html">header – steg0</a> <code>/side-0</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-9.html">idporten – steg5</a> <code>/side-5</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-14.html">forespoersler – steg10</a> <code>/side-10</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-19.html">uu – steg15</a> <code>/side-15</code>
</li>
</ul>
<p><a href="https://dequeuniversity.com/rules/axe/4.10/heading-order">Om regelen (axe)</a></p>
</details><details>
<summary>
ℹ️ <b>The skip-link target should exist</b> <code>skip-link</code> –
2 skanninger,
2 elementer
</summary>
<ul>
<li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-11.html">uu – steg7</a> <code>/side-7</code>
</li><li>
<a href="https://playwrightreporting.z1.web.core.windows.net/41600921382-AT23/AT23/uu/scan-18.html">forespoersler – steg14</a> <code>/side-14</code>
</li>
</ul>
<p><a href="https://dequeuniversity.com/rules/axe/4.10/skip-link">Om regelen (axe)</a></p>
</details> <details>
<summary>
⚙️
<b>1 teknisk UU-feil</b>
(skanningen feilet)
</summary>
<ul>
<li><code>Legg til klient: sluttside: page.screenshot: Timeout 5000ms exceeded.</code></li>
</ul>
</details>


