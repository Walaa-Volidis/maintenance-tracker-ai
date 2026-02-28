'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { MaintenanceRequestCreate, Priority } from '@/types';


const requestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or fewer'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestFormProps {
  onSubmit: (data: MaintenanceRequestCreate) => Promise<unknown>;
}

export function RequestForm({ onSubmit }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { title: '', description: '', priority: 'Low' },
  });

  const handleFormSubmit = async (values: RequestFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-5">
      {/* Title */}
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Leaking faucet in Room 301"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the issue in detail…"
          rows={4}
          {...register('description')}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Priority */}
      <div className="grid gap-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          defaultValue="Low"
          onValueChange={(value: string) =>
            setValue('priority', value as Priority)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Request'
        )}
      </Button>
    </form>
  );
}
