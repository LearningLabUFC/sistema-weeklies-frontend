import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import type { SectorDetail, SectorListItem } from '@/types/sectors';

interface SectorFormContentProps {
  onClose: () => void;
  onSuccess: () => void;
  sectorToEdit?: SectorListItem | SectorDetail | null;
}

function SectorFormContent({
  onClose,
  onSuccess,
  sectorToEdit,
}: SectorFormContentProps) {
  const isEditing = Boolean(sectorToEdit);
  const { showAlertDialog } = useAlertDialog();

  const [nome, setNome] = useState(sectorToEdit?.nome ?? '');
  const [descricao, setDescricao] = useState(sectorToEdit?.descricao ?? '');
  const [ativo, setAtivo] = useState(sectorToEdit?.ativo ?? true);
  const [fieldErrors, setFieldErrors] = useState<{ nome?: string }>({});

  const saveMutation = useAsyncMutation(
    async () => {
      const trimmedNome = nome.trim();
      if (!trimmedNome) {
        setFieldErrors({ nome: 'O nome do setor é obrigatório.' });
        throw new Error('O nome do setor é obrigatório.');
      }
      if (trimmedNome.length > 100) {
        setFieldErrors({
          nome: 'O nome do setor deve ter no máximo 100 caracteres.',
        });
        throw new Error('O nome do setor deve ter no máximo 100 caracteres.');
      }

      if (isEditing && sectorToEdit) {
        return sectorsApi.update(sectorToEdit.id, {
          nome: trimmedNome,
          // No backend, null é ignorado para descrição; string vazia limpa o campo
          descricao: descricao.trim() === '' ? '' : descricao.trim(),
          ativo,
        });
      }

      return sectorsApi.create({
        nome: trimmedNome,
        descricao: descricao.trim() ? descricao.trim() : undefined,
      });
    },
    {
      onSuccess: res => {
        showAlertDialog({
          type: 'success',
          title: isEditing ? 'Setor atualizado' : 'Setor criado',
          message: res.mensagem || 'Operação realizada com sucesso.',
        });
        onSuccess();
        onClose();
      },
      onError: err => {
        if (err.isConflict) {
          setFieldErrors({
            nome: 'Já existe um setor cadastrado com este nome.',
          });
        }
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    saveMutation.execute();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Editar Setor' : 'Criar Novo Setor'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Atualize as informações do setor selecionado.'
            : 'Informe o nome e uma descrição para o novo setor do laboratório.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {saveMutation.error && !saveMutation.error.isConflict && (
          <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            {saveMutation.error.message}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="nome">
            Nome do setor <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="nome"
            value={nome}
            onChange={e => {
              setNome(e.target.value);
              if (fieldErrors.nome) setFieldErrors({});
            }}
            maxLength={100}
            placeholder="Ex: Desenvolvimento Web"
            disabled={saveMutation.isMutating}
            className={fieldErrors.nome ? 'border-rose-500' : ''}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              {fieldErrors.nome ? (
                <span className="text-rose-500">{fieldErrors.nome}</span>
              ) : (
                'Máximo de 100 caracteres'
              )}
            </span>
            <span>{nome.length}/100</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            rows={3}
            placeholder="Breve descrição dos objetivos e escopo deste setor..."
            disabled={saveMutation.isMutating}
          />
        </div>

        {isEditing && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label htmlFor="ativo" className="text-sm font-medium">
                Setor ativo
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setores inativos não permitem submissão de novas weeklies.
              </p>
            </div>
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={setAtivo}
              disabled={saveMutation.isMutating}
            />
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={saveMutation.isMutating}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saveMutation.isMutating || !nome.trim()}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {saveMutation.isMutating && <Spinner className="w-4 h-4" />}
          {isEditing ? 'Salvar alterações' : 'Criar setor'}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface SectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sectorToEdit?: SectorListItem | SectorDetail | null;
}

export function SectorModal({
  isOpen,
  onClose,
  onSuccess,
  sectorToEdit,
}: SectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {isOpen && (
          <SectorFormContent
            key={sectorToEdit?.id ?? 'new'}
            onClose={onClose}
            onSuccess={onSuccess}
            sectorToEdit={sectorToEdit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
