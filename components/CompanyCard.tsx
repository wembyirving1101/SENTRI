import GameIcon from './GameIcon';
interface CompanyCardProps {
    companyName: string;
    department: string;
    role: 'Associate' | 'Executive' | 'Manager';
}
export default function CompanyCard({ companyName, department, role }: CompanyCardProps) {
    return <section className="company-window metal-frame" aria-label={`Company, ${role}`}>
    <h2 className="console-label">COMPANY</h2>
    <div className="company-content"><GameIcon name="building" size={70}/><div className="company-info">
      <p>{companyName}</p><div className="department-label">DEPARTMENT</div><p>{department}</p>
    </div></div>
  </section>;
}
