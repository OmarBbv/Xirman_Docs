import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import { roleService, type RolePayload } from "../services/roleService";

/** Backend xəta cavabından oxunaqlı mesaj çıxarır. */
const errorMessage = (error: unknown) => {
  const detail = (error as AxiosError<{ message?: string | string[] }>).response
    ?.data?.message;
  if (Array.isArray(detail)) return detail.join(", ");
  return detail || "Xəta baş verdi";
};

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  catalog: () => [...roleKeys.all, "catalog"] as const,
};

export const useRoles = (enabled = true) =>
  useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => roleService.getAll(),
    enabled,
  });

export const useRoleCatalog = (enabled = true) =>
  useQuery({
    queryKey: roleKeys.catalog(),
    queryFn: () => roleService.getCatalog(),
    enabled,
    staleTime: Infinity,
  });

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: roleKeys.all });

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RolePayload) => roleService.create(data),
    onSuccess: () => {
      message.success("Rol yaradıldı");
      invalidate(queryClient);
    },
    onError: (error: unknown) => {
      message.error(errorMessage(error));
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<RolePayload, "name"> }) =>
      roleService.update(id, data),
    onSuccess: () => {
      message.success("Rol yeniləndi");
      invalidate(queryClient);
    },
    onError: (error: unknown) => {
      message.error(errorMessage(error));
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleService.delete(id),
    onSuccess: () => {
      message.success("Rol silindi");
      invalidate(queryClient);
    },
    onError: (error: unknown) => {
      message.error(errorMessage(error));
    },
  });
};
