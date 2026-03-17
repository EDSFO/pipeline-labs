import { useEffect, useState } from 'react';
import { Tenant, Service, Professional, Appointment } from '../types';

export function useTenant(slug: string) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tenants/${slug}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Tenant not found');
      })
      .then(data => setTenant(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  return { tenant, loading };
}

export function useTenantData(tenantId: number | undefined) {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    Promise.all([
      fetch(`/api/tenants/${tenantId}/services`).then(res => res.json()),
      fetch(`/api/tenants/${tenantId}/professionals`).then(res => res.json()),
    ]).then(([servicesData, professionalsData]) => {
      setServices(servicesData);
      setProfessionals(professionalsData);
    });
  }, [tenantId]);

  const refreshAppointments = () => {
    if (!tenantId) return;
    fetch(`/api/tenants/${tenantId}/appointments`)
      .then(res => res.json())
      .then(data => setAppointments(data));
  };

  useEffect(() => {
    refreshAppointments();
  }, [tenantId]);

  return { services, professionals, appointments, refreshAppointments };
}
