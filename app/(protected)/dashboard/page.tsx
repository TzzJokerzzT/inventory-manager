"use client";

/**
 * Dashboard page — post-login landing with role-aware greeting and stats.
 *
 * - Shows welcome message with user name
 * - Displays user role badge
 * - Placeholder stats cards (data to be wired from backend later)
 * - Uses HeroUI Card compound components with Lucide icons
 * - Responsive grid layout with Tailwind
 */

import { Card, Chip } from "@heroui/react";
import { useAuth } from "@/lib/auth/presentation/auth-provider";
import {
  DashboardIcon,
  InventoryIcon,
  MovementsIcon,
  PurchasesIcon,
  ReportsIcon,
} from "@/lib/icons";

/** Stat card data — placeholder values until backend integration */
const STATS = [
  {
    label: "Productos en inventario",
    value: "0",
    icon: InventoryIcon,
    color: "bg-primary-soft text-primary-soft-foreground",
  },
  {
    label: "Movimientos hoy",
    value: "0",
    icon: MovementsIcon,
    color: "bg-secondary text-secondary-foreground",
  },
  {
    label: "Órdenes pendientes",
    value: "0",
    icon: PurchasesIcon,
    color: "bg-tertiary text-tertiary-foreground",
  },
  {
    label: "Stock bajo",
    value: "0",
    icon: ReportsIcon,
    color: "bg-danger-soft text-danger-soft-foreground",
  },
];

/** Maps roles to display-friendly Spanish labels */
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  operador: "Operador",
  solo_lectura: "Solo Lectura",
};

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bienvenido{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Resumen de tu panel de control
          </p>
        </div>

        {role && (
          <Chip variant="secondary" size="sm">
            {ROLE_LABELS[role] ?? role}
          </Chip>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="p-4">
              <Card.Content>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      {/* Quick actions section */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
            <DashboardIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Inicio rápido
            </h2>
            <p className="text-sm text-muted">
              Los datos se conectarán cuando el backend esté disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
