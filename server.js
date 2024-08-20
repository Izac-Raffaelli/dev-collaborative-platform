const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());


// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));



// Simulação de dados de projeto
const projectData = {
    tasks: [
        { id: 1, name: 'Implementar Análise de Código', status: 'pendente' },
        { id: 2, name: 'Feedback Automatizado', status: 'pendente' }
    ]
};

// Endpoint para obter dados do projeto
app.get('/api/project', (req, res) => {
    res.json(projectData);
});

// Endpoint para enviar código para análise
app.post('/api/analyze-code', (req, res) => {
    const code = req.body.code;
    const errors = analyzeCode(code);
    res.json({ errors });
});


function analyzeCode(code) {
    const errors = [];

    // Regra 1: Evite o uso de console.log
    if (code.includes('console.log')) {
        errors.push('Evite o uso de console.log em código final.');
    }

    // Regra 2: Verificar variáveis não declaradas
    const undeclaredVariableRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b\s*=\s*[^=]/g;
    const variableDeclarations = code.match(undeclaredVariableRegex);
    if (variableDeclarations) {
        variableDeclarations.forEach(variable => {
            if (!code.includes(`let ${variable}`) && !code.includes(`const ${variable}`) && !code.includes(`var ${variable}`)) {
                errors.push(`A variável '${variable.trim()}' pode não estar declarada.`);
            }
        });
    }

    // Regra 3: Verificar ausência de comentários
    if (!code.includes('//')) {
        errors.push('O código não contém comentários.');
    }

    // Regra 4: Verificar blocos de código muito grandes
    const largeBlockThreshold = 20;
    const lines = code.split('\n');
    let blockSize = 0;
    lines.forEach(line => {
        if (line.trim() === '') {
            if (blockSize > largeBlockThreshold) {
                errors.push(`Bloco de código com ${blockSize} linhas. Considere refatorar.`);
            }
            blockSize = 0;
        } else {
            blockSize++;
        }
    });
    if (blockSize > largeBlockThreshold) {
        errors.push(`Bloco de código com ${blockSize} linhas. Considere refatorar.`);
    }

    // Regra 5: Verificar uso de eval
    if (code.includes('eval(')) {
        errors.push('Evite o uso de eval() por questões de segurança.');
    }

    // Regra 6: Verificar uso de var
    if (code.includes('var ')) {
        errors.push('Prefira o uso de let ou const em vez de var.');
    }

    // Regra 7: Funções muito longas
    const functionRegex = /function\s+\w+\s*\(.*\)\s*{([\s\S]*?)}/g;
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
        const functionCode = match[1];
        const functionLines = functionCode.split('\n').length;
        if (functionLines > 30) {
            errors.push('Função muito longa. Considere dividir em funções menores.');
        }
    }

    // Regra 8: Código repetido (básico)
    const repeatedCodeRegex = /(\b[a-zA-Z_][a-zA-Z0-9_]*\b\s*=\s*[^=]+;)\s*\1/g;
    if (repeatedCodeRegex.test(code)) {
        errors.push('Código repetido detectado. Considere aplicar o princípio DRY.');
    }

    // Regra 9: Verificar falta de tratamento de erros
    if (code.includes('async ') && !code.includes('try {')) {
        errors.push('Possível falta de tratamento de erros em função assíncrona.');
    }

    return errors;
}

// Endpoint para gerar documentação
app.post('/api/generate-docs', (req, res) => {
    const code = req.body.code;
    const documentation = generateDocs(code);
    res.json({ documentation });
});

// Função básica para gerar documentação
function generateDocs(code) {
    const lines = code.split('\n');
    const docs = lines.map(line => {
        if (line.trim().startsWith('//')) {
            return line.trim().substring(2).trim();
        }
        return '';
    }).filter(doc => doc !== '');
    return docs.join('\n');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use((req, res, next) => {
    console.log(`Recebendo solicitação: ${req.method} ${req.url}`);
    next();
});

