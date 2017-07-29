## How to add new icons
Adding new icons is easy. All you have to do is place them in a folder in the `icons/` folder and run the `icons-optimize-and-fix.js` script and it will create the iron-iconset for you.

## What thie script does
The script has several steps:
1. Scans the `icons/src/` directory for `.svg` files.
Grabs the source code from each file, runs it through the svgo optimizer, and places a new `.svg` file with the same name in `icons/optimized`.

2. Bundles all optimized icons as `<g>` groups without a wrapper `<svg>` in `icons/optimized-${name}/_optimized.html`.

3. Then it copies the optimized icons over to the icon set file and notifies you if any icons that were previously definied have disappeared.

The names for the icon come from the source file name. So make sure it is named what you want the final icon to be named.

### <strong>READ THE TERMINAL OUTPUT TO SEE IF #3 HAPPENED. THIS IS THE ONLY CHECK AGAINST A REGRESSION AND AFTER THIS ONE MESSAGE, YOU'LL NEVER SEE IT AGAIN.</strong>

## Step-by-step
1. If you are creating a whole new iconset, you must manually create:
    * the `icons/src-${name}` folder
    * the `icons/optimized-${name}` folder
    * the `px-icon-set-${longname}` file <strong>WITH</strong> the boilerplate svg elements and settings (basically, copy another file, update the size, name, id. Delete the icons elems within the `<defs>` tag).
2. Place your new or modified icon in the correct `src-${name}` file.
3. From your terminal, run `node scripts/icons-optimize-and-fix.js src-${name}`. For example, to rebuild the feature set, you'd run: `node scripts/icons-optimize-and-fix.js src-fea`

#### TO RUN, You must have node 7.6+
* If you're on 7.x run with the flag `node --harmony-async-await`
* If you're on 8.x no flag

## Notes on the source SVGs.
After several iterations, we've found that the SVGs are best if exported with attributes, NOT with styles.
  * From Illustrator, `File > Export > Export As`, choose SVG, and then in the dialog, Change the `Styling` dropdown from Interal CSS to `Presentation Attributes`.
  * stroke and fill attrs will get removed from the end icon, but all other attributes will remain.

#### Things to know, gotchas, & things to fix
* The source file names will become the final icon name.
  * The script currently assumes that we have `filename_${size}x${size}.svg` such as `chevron_16x16.svg`.
    * The script stupidly `.slice(0,-6)` to cut off the _${size}x${size}. If it isnt there, you'll loose real stuff.
  * The script currently assumes that all underscores are use inbetween terms. No Spaces! Each underscore will be replaced with a dash in the icon name. So a srouce name `chevron_right_16x16.svg` will result in the icon name `chevron-right`.
    * Now and then, we got icons named like `up__22x22.svg`. The keen observer will note that there are two underscores, resulting in a final icon name, `up-`. Make sure you rename the source file.
  * The file must have an svg extension
* The SVG structure has several assumptions:
  * It must be a real svg, with svg tags.
  * It will have a `<title>` tag.
  * The `<title>` tag will happen immediately before the real content that we want.
  * Everything after the closing `<title>` tag is content we want (except for the `</svg>` tag)
    * Internally, the script searches for `</title>` and keeps everything after that index. It then replaces the `</svg>` tag.
* All attributes in the kept portion of the SVG will remain, except for `fill` and `stroke`.
  * It will also keep other `id` attributes, a fix we probably want to add because iron-icon-set interprets everything with an id as an icon, even if that id is embedded within another icon.
      * I think Illustrator will assign ids based on layers. Not sure, but they do appear now and then. So watch out.
      * Just remove the extra ids from the source file.
      * Again, only those ids that appear after the `</title>` tag. Everything before gets sliced off.

