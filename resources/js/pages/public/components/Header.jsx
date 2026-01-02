const Header = ({ appName, title, backgroundColor }) => {
    return (
        <div className="border-b" style={{ backgroundColor: backgroundColor }}>
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-4 flex items-center justify-center gap-4">
                    <img src="/images/logo-publico-horizontal.png" alt="Logo" className="w-auto" />
                </div>
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-blue-100">{title}</p>

                    {/* Información adicional */}
                    <div className="text-center sm:text-right">
                        <p className="text-sm text-blue-100">Fecha: {new Date().toLocaleDateString('es-AR')}</p>
                        <p className="text-xs text-blue-200">Documento generado automáticamente</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Header;
