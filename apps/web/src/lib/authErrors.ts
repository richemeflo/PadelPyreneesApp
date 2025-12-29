import axios from "axios";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type ZodIssue = {
  code?: string;
  path?: Array<string | number>;
  minimum?: number;
  validation?: string;
  type?: string;
};

type ErrorResponse = {
  error?: string;
  details?: ZodIssue[];
};

function issueField(issue: ZodIssue) {
  const [first] = issue.path ?? [];
  return typeof first === "string" ? first : undefined;
}

function extractIssues(details: unknown): ZodIssue[] {
  if (!Array.isArray(details)) return [];
  return details.filter((issue): issue is ZodIssue => typeof issue === "object" && issue !== null);
}

function pickIssue(issues: ZodIssue[]) {
  const priority = ["password", "email", "pseudo", "identifier"];
  for (const field of priority) {
    const match = issues.find((issue) => issueField(issue) === field);
    if (match) return match;
  }
  return issues[0];
}

function messageFromIssue(issue: ZodIssue, t: TranslateFn) {
  const field = issueField(issue);
  if (issue.code === "invalid_string" && issue.validation === "email") {
    return t("auth.errors.emailInvalid");
  }

  if (issue.code === "too_small" && issue.type === "string") {
    if (field === "password" && issue.minimum) {
      return t("auth.errors.passwordTooShort", { min: issue.minimum });
    }
    if (field === "pseudo" && issue.minimum) {
      return t("auth.errors.usernameTooShort", { min: issue.minimum });
    }
    if (field === "identifier") {
      return t("auth.errors.identifierRequired");
    }
  }

  return t("auth.errors.validationFailed");
}

export function getAuthErrorMessage(
  error: unknown,
  t: TranslateFn,
  context: "login" | "register",
) {
  const fallbackKey =
    context === "login" ? "auth.errors.loginFailed" : "auth.errors.registerFailed";

  if (!axios.isAxiosError<ErrorResponse>(error)) {
    return t(fallbackKey);
  }

  const status = error.response?.status;
  if (context === "login" && status === 401) {
    return t("auth.errors.invalidCredentials");
  }
  if (context === "register" && status === 409) {
    return t("auth.errors.identifierTaken");
  }

  const issues = extractIssues(error.response?.data?.details);
  if (issues.length > 0) {
    const issue = pickIssue(issues);
    if (issue) {
      return messageFromIssue(issue, t);
    }
  }

  return t(fallbackKey);
}
