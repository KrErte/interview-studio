import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { Subject, takeUntil } from 'rxjs';

type PlanDuration = '7d' | '30d' | '90d';

interface PlanBlock {
  title: string;
  summary: string;
  tasks: string[];
}

@Component({
  selector: 'app-futureproof-roadmap-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './futureproof-roadmap.page.html',
  styleUrls: ['./futureproof-roadmap.page.scss']
})
export class FutureproofRoadmapPageComponent implements OnInit, OnDestroy {
  planDuration: PlanDuration = '7d';

  planBlocks: Record<PlanDuration, PlanBlock[]> = {
    '7d': [
      {
        title: 'Päevad 1-2',
        summary: 'Koonda CV ja intervjuu signaalid ühte profiili.',
        tasks: ['Lae CV ja märgi praegune roll', 'Märgi 3 peamist tugevust', 'Seadista nähtavus']
      },
      {
        title: 'Päevad 3-5',
        summary: 'Testi uusi töövooge ja mõõda valmidust.',
        tasks: ['Katseta 2 uut tööriista', 'Dokumenteeri mõõdikud', 'Lisa õppimismärkmed']
      },
      {
        title: 'Päev 6-7',
        summary: 'Vali üks pöördepositsioon ja lukusta mini-tegevuskava.',
        tasks: ['Vali positsioon', 'Genereeri lühike tegevuskava', 'Jaga persona teatriga tagasisideks']
      }
    ],
    '30d': [
      {
        title: 'Nädal 1',
        summary: 'Süsteemne profiili uuendus ja intervjuu signaalid.',
        tasks: ['Täienda CV signaalid', 'Harjuta 2 mootorit', 'Kaardista lüngad']
      },
      {
        title: 'Nädalad 2-3',
        summary: 'Sügav õppimine ja mõõtmine.',
        tasks: ['Täida 3 mikroprojekti', 'Mõõda tulemusi', 'Tee kordusanalüüs']
      },
      {
        title: 'Nädal 4',
        summary: 'Valmisoleku lukustamine ja nähtavus.',
        tasks: ['Värskenda nähtavust', 'Saada 2 taotlust', 'Kinnita tegevuskava järgmiseks kuuks']
      }
    ],
    '90d': [
      {
        title: 'Kuu 1',
        summary: 'Vundament ja tööriistad.',
        tasks: ['CV ja portfoolio', 'Automatiseerimise praktilised harjutused', 'Valdkonna benchmark']
      },
      {
        title: 'Kuu 2',
        summary: 'Rakendus ja sügavus.',
        tasks: ['3 päris-kasutusjuhtu', 'Jõudlusmõõdikud', 'Tiimikoostöö simulatsioon']
      },
      {
        title: 'Kuu 3',
        summary: 'Turuvalmidus.',
        tasks: ['Persona teatrist tagasiside', 'Nähtavuse kampaania', 'Intervjuu dress rehearsal']
      }
    ]
  };

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private navContext: NavContextService) {}

  ngOnInit(): void {
    this.navContext.setFutureproofNav([
      { label: 'Ülevaade', key: 'OVERVIEW' },
      { label: 'Profiil', key: 'PROFILE' },
      { label: 'Küsimused', key: 'QUESTIONS' },
      { label: 'Analüüs', key: 'ANALYSIS' },
      { label: 'Tegevuskava', key: 'ROADMAP' }
    ]);
    this.navContext.setActiveKey('ROADMAP');
    this.navContext.commands$
      .pipe(takeUntil(this.destroy$))
      .subscribe((key) => {
        if (key === 'ROADMAP') {
          return;
        }
        this.router.navigateByUrl(`/futureproof?step=${key}`);
      });
  }

  ngOnDestroy(): void {
    this.navContext.resetNav();
    this.destroy$.next();
    this.destroy$.complete();
  }

  isPlanDuration(duration: PlanDuration): boolean {
    return this.planDuration === duration;
  }

  selectPlanDuration(duration: PlanDuration): void {
    this.planDuration = duration;
  }

  backToOverview(): void {
    this.router.navigateByUrl('/futureproof');
  }
}

