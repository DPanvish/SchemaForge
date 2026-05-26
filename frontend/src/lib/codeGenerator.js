export const generateMongooseModels = (nodes) => {
  if (!nodes || nodes.length === 0) return [];

  return nodes.map((node) => {
    const { tableName, fields } = node.data;
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const schemaName = `${tableName.toLowerCase()}Schema`;

    let code = `const mongoose = require('mongoose');\n\n`;
    code += `const ${schemaName} = new mongoose.Schema({\n`;

    fields.forEach((field) => {
      let mappedType = field.dataType === 'ObjectId' 
        ? 'mongoose.Schema.Types.ObjectId' 
        : field.dataType.charAt(0).toUpperCase() + field.dataType.slice(1);

      code += `  ${field.name}: { `;

      if (field.isArray) {
        code += `type: [{ type: ${mappedType}`;
        if (field.dataType === 'ObjectId') code += `, ref: 'RelatedModel'`; // Placeholder for target relation
        code += ` }]`;
      } else {
        code += `type: ${mappedType}`;
        if (field.dataType === 'ObjectId') code += `, ref: 'RelatedModel'`; // Placeholder for target relation
      }

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