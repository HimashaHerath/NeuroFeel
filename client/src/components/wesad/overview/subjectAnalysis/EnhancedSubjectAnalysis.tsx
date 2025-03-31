function EnhancedSubjectAnalysis() {
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [selectedEmotion, setSelectedEmotion] = useState<string>("all");
  
    return (
      <div className="space-y-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Subject
                </label>
                <SubjectSelector onSelect={setSelectedSubject} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Filter by Emotion
                </label>
                <Select
                  value={selectedEmotion}
                  onValueChange={(value) => setSelectedEmotion(value)}
                  disabled={!selectedSubject}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All emotions</SelectItem>
                    <SelectItem value="Baseline">Baseline</SelectItem>
                    <SelectItem value="Stress">Stress</SelectItem>
                    <SelectItem value="Amusement">Amusement</SelectItem>
                    <SelectItem value="Meditation">Meditation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
  
        {selectedSubject ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Confusion Matrices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConfusionMatrix subjectId={selectedSubject} modelType="base" />
                <ConfusionMatrix
                  subjectId={selectedSubject}
                  modelType="personal"
                />
                <ConfusionMatrix
                  subjectId={selectedSubject}
                  modelType="ensemble"
                />
                <ConfusionMatrix
                  subjectId={selectedSubject}
                  modelType="adaptive"
                />
              </div>
            </section>
  
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Physiological Signal Analysis
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <SignalVisualization
                    subjectId={selectedSubject}
                    emotion={
                      selectedEmotion === "all" ? undefined : selectedEmotion
                    }
                  />
                </CardContent>
              </Card>
            </section>
          </div>
        ) : (
          <Card className="bg-white border-dashed border-2 border-slate-200">
            <CardContent className="py-12">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-slate-900">
                  No Subject Selected
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Please select a subject to view detailed analysis
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }