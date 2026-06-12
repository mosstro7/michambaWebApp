import { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6 space-y-4 text-center">
        <div
          className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
            danger ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <AlertTriangle size={22} className={danger ? 'text-red-500' : 'text-amber-500'} />
        </div>
        <div>
          <p className="font-semibold text-base">{title}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            className="flex-1"
            isLoading={isSubmitting}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SuccessModalProps {
  title: string;
  description?: string;
  closeLabel?: string;
  onClose: () => void;
}

export function SuccessModal({ title, description, closeLabel = 'Cerrar', onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6 space-y-3 text-center">
        <CheckCircle size={48} className="text-teal-700 mx-auto" />
        <p className="font-semibold text-lg">{title}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        <Button className="w-full mt-2" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}

interface FormModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function FormModal({ title, children, onClose }: FormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
