import { AttributeTemplate } from "./schemas";

export interface AttributeValidationIssue {
  attribute: string;
  message: string;
}

export interface AttributeValidationResult {
  valid: boolean;
  issues: AttributeValidationIssue[];
}

/**
 * Validates product attribute key-value pairs against a category template.
 */
export function validateAttributes(
  values: Record<string, string>,
  templates: AttributeTemplate[]
): AttributeValidationResult {
  const issues: AttributeValidationIssue[] = [];

  for (const template of templates) {
    const rawVal = values[template.name];
    const val = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : "";

    // Required check
    if (template.required && val.length === 0) {
      issues.push({
        attribute: template.name,
        message: `Field '${template.name}' is mandatory`,
      });
      continue;
    }

    if (val.length === 0) {
      continue; // Optional field is empty, which is valid
    }

    // Type validation
    switch (template.type) {
      case "number": {
        const num = Number(val);
        if (isNaN(num)) {
          issues.push({
            attribute: template.name,
            message: `Field '${template.name}' must be a valid number, got '${val}'`,
          });
        }
        break;
      }
      case "boolean": {
        const lower = val.toLowerCase();
        if (lower !== "true" && lower !== "false" && lower !== "1" && lower !== "0" && lower !== "yes" && lower !== "no") {
          issues.push({
            attribute: template.name,
            message: `Field '${template.name}' must be a boolean ('true' or 'false'), got '${val}'`,
          });
        }
        break;
      }
      case "select": {
        if (template.options && template.options.length > 0) {
          const match = template.options.some((opt) => opt.toLowerCase() === val.toLowerCase());
          if (!match) {
            issues.push({
              attribute: template.name,
              message: `Value '${val}' is not one of valid options: ${template.options.join(", ")}`,
            });
          }
        }
        break;
      }
      case "text":
      default:
        break;
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
