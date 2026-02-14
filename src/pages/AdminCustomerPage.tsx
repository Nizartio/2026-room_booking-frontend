import { useEffect, useState, useCallback, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  fetchCustomers,
  deleteCustomer,
  createCustomer,
  updateCustomer
} from "../api/customerApi";
import { getApiErrorMessage } from "../api/apiClient";
import type { Customer } from "../types/customer";
import ConfirmModal from "../components/common/ConfirmModal";

function AdminCustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    isActive: true
  });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchCustomers(search, page, pageSize);
      setCustomers(response.data);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Gagal memuat customer."));
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      isActive: true
    });
    setSelectedCustomer(null);
  };

  const openCreate = () => {
    resetForm();
    setFormMode("create");
    setIsFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormMode("edit");
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      isActive: customer.isActive
    });
    setIsFormOpen(true);
  };

  const openDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Nama dan email wajib diisi.");
      return;
    }

    try {
      if (formMode === "create") {
        await createCustomer({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined
        });
        toast.success("Customer berhasil ditambahkan.");
      } else if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          isActive: formData.isActive
        });
        toast.success("Customer berhasil diperbarui.");
      }

      closeForm();
      resetForm();
      loadCustomers();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Terjadi kesalahan."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomer(customerToDelete.id);
      toast.success("Customer berhasil dihapus.");
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Gagal menghapus customer."));
    }
  };

  const totalPagesSafe = Math.max(totalPages, 1);
  const startItem = totalItems === 0
    ? 0
    : (page - 1) * pageSize + 1;
  const endItem = totalItems === 0
    ? 0
    : Math.min(page * pageSize, totalItems);

  return (
    <div className="p-8 bg-sky-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Customer Management
      </h1>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="text"
          placeholder="Search name/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-yellow-300 px-3 py-2 rounded-md w-80 bg-white text-black"
        />
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-md bg-rose-500 text-white hover:opacity-90"
        >
          Add Customer
        </button>
      </div>

      {loading && <p className="text-black">Loading...</p>}

      {!loading && (
        <div className="space-y-4">
          {customers.map(customer => (
            <div
              key={customer.id}
              className="border border-yellow-300 bg-white p-4 rounded-lg flex justify-between items-center shadow-sm"
            >
              <div>
                <h2 className="font-semibold text-black">
                  {customer.name}
                </h2>
                <p className="text-sm text-rose-600">
                  {customer.email}
                </p>
                <p className="text-xs text-yellow-500">
                  {customer.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => openEdit(customer)}
                  className="text-rose-600 text-sm hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => openDelete(customer)}
                  className="text-black text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {customers.length === 0 && (
            <p className="text-rose-600">
              No customers found.
            </p>
          )}

          {customers.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <p className="text-sm text-rose-600">
                Showing {startItem}-{endItem} of {totalItems}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-2 border border-yellow-300 rounded-md text-sm disabled:opacity-50 bg-white text-black hover:bg-sky-100"
                >
                  Prev
                </button>
                <span className="text-sm text-black">
                  Page {page} of {totalPagesSafe}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(totalPagesSafe, prev + 1))}
                  disabled={page >= totalPagesSafe || loading}
                  className="px-3 py-2 border border-yellow-300 rounded-md text-sm disabled:opacity-50 bg-white text-black hover:bg-sky-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg border border-yellow-300">
            <h2 className="text-lg font-semibold mb-4 text-black">
              {formMode === "create" ? "Tambah Customer" : "Edit Customer"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="w-full border border-yellow-300 rounded-md px-3 py-2 bg-white text-black focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  className="w-full border border-yellow-300 rounded-md px-3 py-2 bg-white text-black focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  className="w-full border border-yellow-300 rounded-md px-3 py-2 bg-white text-black focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                  className="w-full border border-yellow-300 rounded-md px-3 py-2 bg-white text-black focus:border-rose-500 focus:outline-none"
                  rows={3}
                />
              </div>

              {formMode === "edit" && (
                <label className="inline-flex items-center gap-2 text-sm text-black">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isActive: e.target.checked
                    }))}
                  />
                  Active
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-yellow-300 rounded-md text-black hover:bg-sky-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-rose-500 text-white hover:opacity-90"
                >
                  {formMode === "create" ? "Save" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Hapus Customer"
        message="Yakin hapus customer ini?"
        onCancel={() => {
          setIsDeleteOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default AdminCustomerPage;