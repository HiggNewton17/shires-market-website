module.exports = function (eleventyConfig) {
  // Copy static assets through to the build output untouched.
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/script.js": "script.js" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap.xml": "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/404.html": "404.html" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // These are copied verbatim above, so keep Eleventy from also templating them.
  eleventyConfig.ignores.add("src/404.html");
  eleventyConfig.ignores.add("src/admin/**");

  // Turn newlines from a CMS text field into <br> (escaping the text first).
  eleventyConfig.addFilter("nl2br", function (value) {
    if (value === undefined || value === null) return "";
    const escaped = String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    return escaped.replace(/\r?\n/g, "<br>");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
      includes: "_includes"
    }
  };
};
