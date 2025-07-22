const generateManual = require('./generate-manual.js');
const generateModalidadesDoc = require('./generate-modalidades-doc.js');
const generateAdminManual = require('./generate-admin-manual.js');

async function generateAllDocs() {
    try {
        console.log('📚 Generando documentación completa de PsiConnect...');
        console.log('');
        
        console.log('1️⃣ Generando Manual de Usuario...');
        await generateManual();
        console.log('');
        
        console.log('2️⃣ Generando Documentación Técnica de Modalidades...');
        await generateModalidadesDoc();
        console.log('');
        
        console.log('3️⃣ Generando Manual del Panel de Administración...');
        await generateAdminManual();
        console.log('');
        
        console.log('🎉 ¡Documentación completa generada exitosamente!');
        console.log('');
        console.log('📄 Archivos generados:');
        console.log('   • Manual-Usuario-PsiConnect.pdf');
        console.log('   • Documentacion-Modalidades-PsiConnect.pdf');
        console.log('   • Manual-Panel-Administracion-PsiConnect.pdf');
        console.log('');
        console.log('✨ Todos los documentos están listos para distribución.');
        
    } catch (error) {
        console.error('❌ Error al generar la documentación completa:', error);
        process.exit(1);
    }
}

// Ejecutar la función
if (require.main === module) {
    generateAllDocs();
}

module.exports = generateAllDocs; 