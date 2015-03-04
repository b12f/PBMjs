# PBMjs

<p>PBMjs automatically finds all <code>img</code> tags with a pbm as source and puts a canvas element in place displaying the specified resource, even when elements get dynamically added. PBMjs supports P1, P2 and P3 (pbm, pgm and ppm) using mime-type recognition. Because of missing 'Access-Control-Allow-Origin' headers on most external images you are going to request images might not be able to load. Check the console for errors and request the image from your own domain.</p>

<p>Currently only ASCII format images are supported.</p>

<p>Supported are all <a href="http://caniuse.com/#feat=mutationobserver" title="CanIuse Mutation Observer">modern browsers (IE 11 and up)</a> if you want to watch for changes in the DOM. For run-once use, <a href="http://caniuse.com/#feat=canvas" title="CanIuse Canvas">IE9+ is supported</a></p>

<p>It is released under the <i>Do What the Fuck You Want to Public License</i>.</p>

<br />
<a href="http://www.wtfpl.net/"><img
       src="http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-badge-4.png"
       width="80" height="15" alt="WTFPL" /></a></p>

<h3>Config Options</h3>
<table>
    <tr>
        <th>Name</th>
        <th>Possible value</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>useIMGclass</code></td>
        <td>Boolean</td>
        <td><code>true</code></td>
        <td>Specifies whether the classes used on the img element should be put on the canvas element. <b>The width and height of the img element will always be used for the canvas element by default, even if no class or ID is specified.</b></td>
    </tr>
    <tr>
        <td><code>class</code></td>
        <td>String</td>
        <td><code>""</code></td>
        <td>Extra class(es) to be added to each canvas element.</td>
    </tr>
    <tr>
        <td><code>useIMGId</code></td>
        <td>Boolean</td>
        <td><code>true</code></td>
        <td>Specifies whether the img id should be put on the canvas element.</td>
    </tr>
    <tr>
        <td><code>autorun</code></td>
        <td>Boolean</td>
        <td><code>true</code></td>
        <td>If true, the code will run at least once after loading. This is useful if your code is loaded after the dom.</td>
    </tr>
    <tr>
        <td><code>observe</code></td>
        <td>Boolean</td>
        <td><code>true</code></td>
        <td>If true, PBMjs will listen to DOM mutations and convert any new img elements with pbm sources.</td>
    </tr>
    <tr>
        <td colspan="4">! If both observe and autorun are <code>false</code>, PBMjs will not make any changes at all.</td>
    </tr>
    <tr>
        <td><code>observeContainer</code></td>
        <td>Node</td>
        <td><code>document</code></td>
        <td>Container which will be observed for mutations in the DOM.</td>
    </tr>
    <tr>
        <td><code>alwaysrender</code></td>
        <td>Boolean</td>
        <td><code>true</code></td>
        <td>If true, pixelerrors in PBM files will be ignored, the specified pixel will be white.</td>
    </tr>
</table>

<h3>Demo:</h3>
<a href="http://playground.benjaminbaedorf.com/project/PBMjs" target="_blank" rel="view">View</a>