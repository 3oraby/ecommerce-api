const pug = require("pug");
const path = require("path");

exports.renderTemplate = ({
  folder = "modules",
  moduleName,
  templateName,
  data = {},
}) => {
  const templatePath = path.join(
    process.cwd(),
    "src",
    folder,
    moduleName,
    "templates",
    `${templateName}.pug`,
  );

  return pug.renderFile(templatePath, data);
};
