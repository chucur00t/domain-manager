
'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Check, FileText, UserCheck, ShieldCheck, XCircle } from "lucide-react";

type StepProps = {
  label: string;
  icon: React.ElementType;
  isCurrent: boolean;
  isCompleted: boolean;
};

const steps = [
  { label: "Diajukan", icon: FileText },
  { label: "Review Admin", icon: UserCheck },
  { label: "Persetujuan", icon: ShieldCheck },
  { label: "Selesai", icon: Check },
];

function Step({ label, icon: Icon, isCurrent, isCompleted }: StepProps) {
  return (
    <div className="relative flex flex-col items-center justify-start text-center w-full">
        <div
            className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition duration-500 ease-in-out border-2",
             isCompleted || isCurrent ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
            )}
        >
            <Icon className="h-6 w-6" />
        </div>
        <p className={cn("mt-3 font-semibold text-xs", isCurrent ? "text-primary" : "text-muted-foreground")}>{label}</p>
    </div>
  );
}

function Connector({ isCompleted }: { isCompleted: boolean }) {
    return (
        <div
            className={cn(
              "flex-auto border-t-2 transition duration-500 ease-in-out mx-4 -translate-y-9",
              isCompleted ? "border-primary" : "border-border"
            )}
        ></div>
    )
}


function RejectedStep() {
    return (
        <div className="flex flex-col items-center text-destructive space-y-2">
            <XCircle className="h-12 w-12" />
            <p className="font-semibold text-sm">Permohonan Ditolak</p>
        </div>
    )
}

type WorkflowStepperProps = {
  currentStep: number; // 0 for rejected, 1 for step 1, etc.
  isRejected: boolean;
};

export function WorkflowStepper({ currentStep, isRejected }: WorkflowStepperProps) {
  if (isRejected) {
    return (
        <div className="flex justify-center items-center py-10">
            <RejectedStep />
        </div>
    )
  }

  return (
    <div className="w-full py-10 px-4">
      <div className="flex items-start">
        {steps.map((step, index) => (
            <React.Fragment key={index}>
                 <Step
                    label={step.label}
                    icon={step.icon}
                    isCurrent={currentStep === index + 1}
                    isCompleted={currentStep > index + 1}
                />
                {index < steps.length - 1 && (
                    <Connector isCompleted={currentStep > index + 1} />
                )}
            </React.Fragment>
        ))}
      </div>
    </div>
  );
}
