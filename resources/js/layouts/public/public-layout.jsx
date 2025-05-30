const LayoutPublic = ({ children }) => {
    return (
        <>
            <header>HEADER</header>
            <main className="flex">{children}</main>
            <footer>&copy; {new Date().getFullYear()} - Mi App con Inertia + React</footer>
        </>
    );
};

export default LayoutPublic;
