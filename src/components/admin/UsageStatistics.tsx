import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

// Enregistrement des composants de Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const UsageStatistics = () => {
    const data = {
        labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'], // à remplacer par les données réelles plus tard
        datasets: [
            {
                label: 'Nombre de chutes',
                data: [12, 19, 3, 5], // à remplacer par les données réelles plus tard
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
            {
                label: 'Temps d\'intervention (minutes)',
                data: [5, 10, 15, 7], // à remplacer par les données réelles plus tard
                borderColor: 'rgba(255,99,132,1)',
                fill: false,
            },
        ],
    };

    return (
        <div>
            <h2>Statistiques d'Usage</h2>
            <Line data={data} />
        </div>
    );
};

export default UsageStatistics;