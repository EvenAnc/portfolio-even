import sys
try:
    with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    replacements = {
        'd\'intrieur': 'd\'intérieur',
        'd\'int?rieur': 'd\'intérieur',
        'diplm': 'diplômé',
        'diplm?': 'diplômé',
        'DIPLME': 'DIPLÔME',
        'DIPL"ME': 'DIPLÔME',
        'DIPL"ME': 'DIPLÔME',
        'DIPLME': 'DIPLÔME',
        'ralisations': 'réalisations',
        'lumire': 'lumière',
        'matire': 'matière',
        ' main leve': 'à main levée',
        'modlisations': 'modélisations',
        'mod?lisations': 'modélisations',
        'modlisations': 'modélisations',
        'R%SIDENCE': 'RÉSIDENCE',
        'Int?rieur': 'Intérieur',
        'CR%DENTIALS ACAD%MIQUES': 'CRÉDENTIALS ACADÉMIQUES',
        'COMP%TENCES CL%S ACCR%DIT%ES': 'COMPÉTENCES CLÉS ACCRÉDITÉES',
        '%tablir': 'Établir',
        'r?glementaire': 'réglementaire',
        'am?nager': 'aménager',
        'photor?alistes': 'photoréalistes',
        'S?lectionner': 'Sélectionner',
        'mat?riaux': 'matériaux',
        'maktrise': 'maîtrise',
        'd\'"uvre': 'd\'œuvre',
        'ex?cution': 'exécution',
        'Comp?tences': 'Compétences',
        'Enregistr?': 'Enregistré',
        'Flche': 'Flèche',
        'prcdent': 'précédent',
        'Suivant': 'Suivant',
        'R%GLEMENTAIRE': 'RÉGLEMENTAIRE',
        'd\'intrieur': 'd\'intérieur',
        'diplm': 'diplômé',
        'ralisations': 'réalisations',
        'lumire': 'lumière',
        'matire': 'matière',
        ' main leve': 'à main levée',
        'Aller  la page': 'Aller à la page'
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print('Encoding fixes applied!')
except Exception as e:
    print(e)
