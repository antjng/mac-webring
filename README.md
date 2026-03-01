# McMaster CS Webring

This repository contains the source for the **McMaster Computer Science Webring**.

Visit the site [here](https://www.macwebring.xyz/).

If you are unfamiliar with how webrings work, or why someone would build one in the year that it currently is, [here](https://brisray.com/web/webring-tech.htm) is an excellent overview.

---

### How to add your site

If you are a McMaster CS student, alumnus, or otherwise reasonably affiliated, you may add your site.

This is done by opening a **pull request**.

1. Fork the repository
2. Add your site to the data file (see `js/data.js`) at the **bottom** of the list.
   Follow this format:
```javascript
{
    "name": "Your Name",
    "year": "YYYY",
    "website": "https://yoursite.com"
},
```
3. Submit a pull request

That is the entire process.

The pull request will be reviewed by an actual human being.
The review consists primarily of confirming that:
- the link works
- the site exists

---

### Widget template

Because every website is different, there is no required way to display the webring navigation.

You are encouraged to style it however you like.

That said, if you would prefer to start from something that already works, the following examples are provided as a baseline.

#### HTML

```html
<div style="display: flex; align-items: center; gap: 8px;">
  <a href="https://www.macwebring.xyz/prev?from=https://yoursite.com">←</a>

  <a href="https://www.macwebring.xyz/" target="_blank" rel="noopener">
    <img
      src="https://www.macwebring.xyz/assets/icons/icon.black.svg"
      alt="McMaster CS Webring"
      style="width: 24px; height: auto; opacity: 0.8;"
    />
  </a>

  <a href="https://www.macwebring.xyz/next?from=https://yoursite.com">→</a>
</div>
````

Replace `https://yoursite.com` with your actual site URL (must match the one you added to `js/data.js`).

#### JSX / React

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <a href="https://www.macwebring.xyz/prev?from=https://yoursite.com">←</a>

  <a href="https://www.macwebring.xyz/" target="_blank" rel="noopener noreferrer">
    <img
      src="https://www.macwebring.xyz/assets/icons/icon.black.svg"
      alt="McMaster CS Webring"
      style={{ width: '24px', height: 'auto', opacity: 0.8 }}
    />
  </a>

  <a href="https://www.macwebring.xyz/next?from=https://yoursite.com">→</a>
</div>
```

#### Notes

* For dark-themed websites, consider using `icon.white.svg`.
* You may host the icon locally if that better suits your setup.
* You may resize, recolor, or replace the icon entirely.
* Inline styles are used here for clarity, not as a recommendation.

There is no requirement to use this layout, these icons, or even an image at all.

---

### Icons

A small set of webring icons are available:

- Black: [https://www.macwebring.xyz/assets/icons/icon.black.svg](https://www.macwebring.xyz/assets/icons/icon.black.svg)
- Maroon: [https://www.macwebring.xyz/assets/icons/icon.maroon.svg](https://www.macwebring.xyz/assets/icons/icon.maroon.svg) 
- Red: [https://www.macwebring.xyz/assets/icons/icon.red.svg](https://www.macwebring.xyz/assets/icons/icon.red.svg)
- White: [https://www.macwebring.xyz/assets/icons/icon.white.svg](https://www.macwebring.xyz/assets/icons/icon.white.svg)

You may use one of these, modify them, recolor them, or ignore them entirely.

If you dislike all of them, editing the SVGs directly is encouraged.

---

### Requirements for inclusion

Your site should:

- belong to you
- be publicly accessible
- not be malicious

It does **not** need to be:
- finished
- impressive
- up to date
- styled correctly

---

### Credits and Inspiration

This project did not appear in a vacuum.

It is heavily inspired by a number of existing webrings and directories, particularly those maintained by students and small communities who have decided that linking to one another directly is still a reasonable thing to do.

In no particular order:

- [https://sydeb.me](https://sydeb.me)  
- [https://cs.uwatering.com](https://cs.uwatering.com)
- [https://se-webring.xyz](https://se-webring.xyz)
- [https://firechicken.club/](https://firechicken.club/)
- [https://hotlinewebring.club/](https://hotlinewebring.club/)
- [https://a11y-webring.club/](https://a11y-webring.club/)
- [https://cs.sjoy.lol/#webring](https://cs.sjoy.lol/#webring)
- [https://fediring.net/](https://fediring.net/)

This webring was built and is currently maintained by me (Anita).

If something here is broken, incorrect, missing, or otherwise behaving in a way that feels unintended, please reach out.

Opening an issue is fine.

Opening a pull request is better.

Either will be seen.