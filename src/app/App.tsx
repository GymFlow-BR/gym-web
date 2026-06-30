import { AdminLayout } from '../components/layout/AdminLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { StudentLayout } from '../components/layout/StudentLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

function App() {
  return (
    <AdminLayout>
      <PageHeader
        title="Componentes base"
        description="Demonstração inicial dos componentes e layouts reutilizáveis do GymFlow Web."
        action={<Button>Novo exercício</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Área administrativa</h2>

          <p className="mt-1 text-sm text-slate-400">
            Exemplo de formulário para professor/admin gerenciar exercícios.
          </p>

          <div className="mt-5 space-y-4">
            <Input
              label="Nome do exercício"
              name="exerciseName"
              placeholder="Ex: Supino reto"
              helperText="Use um nome claro para facilitar a busca."
            />

            <Input
              label="Grupo muscular"
              name="muscleGroup"
              placeholder="Ex: Peito"
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button fullWidth>Salvar</Button>

              <Button fullWidth variant="secondary">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Preview mobile do aluno</h2>

          <p className="mt-1 text-sm text-slate-400">
            Simulação da experiência mobile-first para visualização do treino
            atual.
          </p>

          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800">
            <StudentLayout preview>
              <section>
                <p className="text-sm text-slate-400">Treino atual</p>

                <h2 className="mt-1 text-2xl font-bold">
                  Treino A - Peito e Tríceps
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Complete os exercícios abaixo seguindo a ordem recomendada.
                </p>
              </section>

              <div className="mt-6 space-y-4">
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Supino reto
                      </p>

                      <p className="mt-1 text-sm text-slate-400">Peito</p>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      1º
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">Séries</p>
                      <p className="mt-1 font-semibold">4</p>
                    </div>

                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">Reps</p>
                      <p className="mt-1 font-semibold">10</p>
                    </div>

                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">Descanso</p>
                      <p className="mt-1 font-semibold">60s</p>
                    </div>
                  </div>

                  <Button className="mt-5" fullWidth>
                    Ver exercício
                  </Button>
                </Card>
              </div>
            </StudentLayout>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default App