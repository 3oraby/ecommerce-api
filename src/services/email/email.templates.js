const pug = require("pug");
const path = require("path");

exports.renderTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, "templates", `${templateName}.pug`);
  return pug.renderFile(templatePath, data);
};
