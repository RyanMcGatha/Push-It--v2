-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" TEXT DEFAULT 'welcome';
