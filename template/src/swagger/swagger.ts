import { Application } from "express";
import { middleware as openApiValidator } from "express-openapi-validator";
import fs from "fs";
import YAML from "js-yaml";
import path from "path";
import swaggerUi from "swagger-ui-express";

const loadYamlFile = (filePath: string) => {
  return YAML.load(fs.readFileSync(path.resolve(filePath), "utf8"));
};

const deepMerge = (target: any, source: any) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  return { ...target, ...source };
};

const mergeComponents = (target: any, source: any) => {
  if (!source.components) return target;
  target.components = target.components || {};
  for (const section of Object.keys(source.components)) {
    target.components[section] = {
      ...target.components[section],
      ...source.components[section],
    };
  }
  return target;
};

export const setupSwagger = (app: Application) => {
  let swaggerDoc: any = loadYamlFile(path.join(__dirname, "swagger.base.yaml"));

  const componentsDir = path.join(__dirname, "components");
  const schemasDir = path.join(componentsDir, "schemas");
  const modulesDir = path.join(__dirname, "modules");

  swaggerDoc = mergeComponents(
    swaggerDoc,
    loadYamlFile(path.join(componentsDir, "security.yaml"))
  );
  swaggerDoc = mergeComponents(
    swaggerDoc,
    loadYamlFile(path.join(componentsDir, "response.yaml"))
  );
  swaggerDoc = mergeComponents(
    swaggerDoc,
    loadYamlFile(path.join(componentsDir, "parameters.yaml"))
  );

  fs.readdirSync(schemasDir).forEach((file) => {
    swaggerDoc = mergeComponents(
      swaggerDoc,
      loadYamlFile(path.join(schemasDir, file))
    );
  });

  fs.readdirSync(modulesDir).forEach((file) => {
    swaggerDoc = deepMerge(
      swaggerDoc,
      loadYamlFile(path.join(modulesDir, file))
    );
  });

  console.log("Merged components keys:", Object.keys(swaggerDoc.components));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.use(
    openApiValidator({
      apiSpec: swaggerDoc,
      validateRequests: true,
      validateResponses: false,
    })
  );

  console.log("✅ Swagger ready at /docs");
};
