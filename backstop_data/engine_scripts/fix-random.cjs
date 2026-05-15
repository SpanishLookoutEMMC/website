module.exports = async (page, scenario, vp) => {
  await page.evaluateOnNewDocument(() => {
    Math.random = () => 0;
  });
};
