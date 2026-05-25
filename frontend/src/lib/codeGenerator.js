
export const generateMongooseModels = (nodes) => {
  if (!nodes || nodes.length === 0) return [];

  return nodes.map((node) => {
    const { tableName, fields } = node.data;
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const schemaName = `${tableName.toLowerCase()}Schema`;

    let code = `const mongoose = require('mongoose');\n\n`;
    code += `const ${schemaName} = new mongoose.Schema({\n`;

    fields.forEach((field) => {
      // Map visual data types to Mongoose valid types
      let mappedType = field.dataType;
      if (['string', 'number', 'boolean', 'date'].includes(mappedType.toLowerCase())) {
        mappedType = mappedType.charAt(0).toUpperCase() + mappedType.slice(1);
      }

      code += `  ${field.name}: { type: ${mappedType}`;
      if (field.isRequired) code += `, required: true`;
      if (field.isUnique) code += `, unique: true`;
      code += ` },\n`;
    });

    code += `}, { timestamps: true });\n\n`;
    code += `module.exports = mongoose.model('${modelName}', ${schemaName});`;

    return {
      filename: `${modelName}.js`,
      code: code
    };
  });
};