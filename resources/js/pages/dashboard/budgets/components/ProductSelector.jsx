import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Plus, Check, Package } from 'lucide-react';
import axios from 'axios';

export default function ProductSelector({ value, onChange, selectedProduct, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    // Buscar productos cuando cambie el término de búsqueda
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (search.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                searchProducts(search);
            }, 300);
        } else {
            setProducts([]);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    // Establecer texto de búsqueda basado en producto seleccionado
    useEffect(() => {
        if (selectedProduct) {
            setSearch(`${selectedProduct.name} (${selectedProduct.sku})`);
        } else if (value && !selectedProduct) {
            // Si hay un valor pero no producto seleccionado, buscar datos
            fetchProductData(value);
        }
    }, [selectedProduct, value]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchProducts = async (searchTerm) => {
        setLoading(true);
        try {
            const response = await axios.get(route('api.products.search'), {