export default function ApplicationLogo({ className = '', ...props }) {
    const isLarge = className.includes('w-20') || className.includes('h-20');
    return (
        <div className={`bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 ${className || 'w-10 h-10 text-2xl'}`} {...props}>
            <span className={isLarge ? 'text-4xl' : ''}>BH</span>
        </div>
    );
}
