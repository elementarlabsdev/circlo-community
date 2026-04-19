export const COMPLAINTS_TARGET_VALIDATOR = 'ComplaintsTargetValidator';

export interface ComplaintsTargetValidator {
  validateExists(targetType: string, targetId: string): Promise<boolean>;
  supportedTypes(): string[];
}
