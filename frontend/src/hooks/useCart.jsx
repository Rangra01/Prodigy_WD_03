import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { cartAPI } from '../services/api';

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cartAPI.get();
      setItems(response.data.items || []);
      setItemCount(response.data.item_count || 0);
      setTotal(response.data.total || 0);
    } catch (err) {
      setItems([]);
      setItemCount(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [user, loadCart]);

  const add = async (productId, quantity) => {
    await cartAPI.add({ productId, quantity });
    await loadCart();
  };

  const update = async (productId, quantity) => {
    await cartAPI.update(productId, quantity);
    await loadCart();
  };

  const remove = async (productId) => {
    await cartAPI.remove(productId);
    await loadCart();
  };

  const clear = async () => {
    await cartAPI.clear();
    setItems([]);
    setItemCount(0);
    setTotal(0);
  };

  return {
    items,
    itemCount,
    total,
    loading,
    add,
    update,
    remove,
    clear,
    refresh: loadCart,
  };
}
